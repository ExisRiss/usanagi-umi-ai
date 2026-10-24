
import { settings } from '../config/settings.js'
import { getActivePrefix } from './awang-prefix.js'
import { limitsEnabled } from '../lib/limit-mode.js'
import { findPluginByCommand } from './awang-loader.js'
import { sendTypoSuggestion } from './awang-typo.js'
import { enqueue } from './awang-antrian.js'
import { isOwner } from '../lib/awang-cekakses.js'
import { getAccessModeState, isAccessAllowed } from './awang-mode.js'
import { touchUser, isUserPremium, reserveUserLimit, commitUserLimit, releaseUserLimit } from './awang-userdb.js'
import { isPremiumCommand, isLimitCommand, isOwnerCommand, isGroupCommand } from './awang-status.js'
import { printCommandLog } from '../tampilan/awang-banner.js'
import { handleAntiLinkMessage } from './awang-link.js'
import { handleAntiSwGcMessage } from './awang-antiswgc.js'
import { handleAntiTagSwMessage } from './awang-antitagsw.js'
import { isChatBanned } from './awang-banchat.js'
import { getAfk, removeAfk, formatAfkDuration } from './awang-afk.js'
import { createStyledConnection, sendGroupOnlyReply, sendStyledReply } from '../lib/awang-reply.js'
import { handlePrivateWelcome } from './awang-private.js'
import { resetPrivateWelcomeForChat } from './awang-welcome.js'
import { getUser as getRpgUser } from '../lib/rpg/awang-db.js'
import { withRpgLocks } from '../lib/rpg/awang-lock.js'

const attachedRouters = new WeakSet()
let activeRouterConnection = null

function unwrapMessage(message) {
  let current = message
  for (let i = 0; i < 6; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message
    if (!next || next === current) break
    current = next
  }
  return current || {}
}

function extractText(message) {
  message = unwrapMessage(message)
  const nativeFlowResponse = message?.interactiveResponseMessage?.nativeFlowResponseMessage

  if (nativeFlowResponse?.paramsJson) {
    try {
      const params = JSON.parse(nativeFlowResponse.paramsJson)
      if (params?.id) return params.id
    } catch {

    }
  }

  return (
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.videoMessage?.caption ||
    message?.documentMessage?.caption ||
    message?.documentWithCaptionMessage?.message?.documentMessage?.caption ||
    message?.buttonsResponseMessage?.selectedButtonId ||
    message?.listResponseMessage?.singleSelectReply?.selectedRowId ||
    message?.templateButtonReplyMessage?.selectedId ||
    ''
  )
}

function parseCommand(text, prefix) {
  if (!text.startsWith(prefix)) return null

  const withoutPrefix = text.slice(prefix.length).trim()
  const [command, ...rest] = withoutPrefix.split(/\s+/)

  return {
    command: (command || '').toLowerCase(),
    args: rest,
    text: rest.join(' '),
  }
}

export function attachMessageRouter(conn) {
  if (!conn?.ev?.on) return
  activeRouterConnection = conn
  if (attachedRouters.has(conn)) return
  attachedRouters.add(conn)

  conn.ev.on('chats.delete', (chatIds = []) => {
    if (conn !== activeRouterConnection) return
    for (const chatId of Array.isArray(chatIds) ? chatIds : []) {
      resetPrivateWelcomeForChat(chatId, conn).catch((err) => {
        console.log(`  \x1b[33m⚠\x1b[0m  Reset welcome saat chat dihapus gagal untuk ${chatId}: ${err?.message || err}`)
      })
    }
  })

  conn.ev.on('messages.upsert', async ({ messages, type }) => {
    if (conn !== activeRouterConnection) return
    if (type !== 'notify') return

    for (const raw of messages) {
      if (!raw.message) continue
      const allowSelf = settings.messageRouting?.respondToSelf !== false
      if (raw.key.fromMe && !allowSelf) continue

      enqueue(raw.key.id, async () => {
        await handleIncomingMessage(conn, raw)
      })
    }
  })
}


async function handleIncomingMessage(conn, raw) {
  const chat = raw.key.remoteJid
  if (!chat || chat === 'status@broadcast') return
  const isSelf = Boolean(raw.key.fromMe)
  const sender = isSelf ? (conn.user?.id || raw.key.participant || raw.key.remoteJid) : (raw.key.participant || raw.key.remoteJid)
  const prefix = await getActivePrefix(chat)

  const messageContent = unwrapMessage(raw.message)
  try {
    await handlePrivateWelcome(conn, raw, {
      chat,
      sender,
      isSelf,
      pushName: raw.pushName || (isSelf ? 'Owner' : 'Kak'),
      prefix,
      messageContent,
    })
  } catch (err) {
    console.log(`  \x1b[33m⚠\x1b[0m  Welcome private error: ${err?.message || err}`)
  }

  const moderated = await handleAntiLinkMessage(conn, raw)
  if (moderated) return

  const swgcModerated = await handleAntiSwGcMessage(conn, raw)
  if (swgcModerated) return

  const tagSwModerated = await handleAntiTagSwMessage(conn, raw)
  if (tagSwModerated) return

  const text = extractText(messageContent)
  const parsed = text ? parseCommand(text, prefix) : null

  if (!isSelf) {
    await handleAfkCheck(conn, chat, sender, messageContent, parsed?.command).catch((err) => {
      console.log(`  \x1b[33m⚠\x1b[0m  AFK check error: ${err?.message || err}`)
    })
  }

  if (!text || !parsed) return

  const plugin = findPluginByCommand(parsed.command)
  const isGroup = chat.endsWith('@g.us')

  if (isGroup && !isSelf) {
    const ownerCaller = await isOwner(sender, conn)
    if (!ownerCaller && isChatBanned(chat)) return
  }

  if (!plugin?.accessModeControl) {
    const accessState = getAccessModeState()
    if (!isAccessAllowed(isGroup, accessState)) {
      const target = accessState.onlygc ? 'GROUP' : 'PRIVATE CHAT'
      await sendStyledReply(
        conn,
        chat,
        [
          '╭─「 USANAGI • ACCESS DENIED 」',
          '│',
          `│ Mode    : *${accessState.onlygc ? 'ONLY GROUP' : 'ONLY PRIVATE'}*`,
          `│ Chat    : *${isGroup ? 'GROUP' : 'PRIVATE'}*`,
          '│',
          '│ Akses dari chat ini sedang dibatasi.',
          `│ Gunakan bot melalui *${target}*.`,
          '╰────────────────╯',
        ].join('\n'),
        { originalMessage: raw }
      )
      return
    }
  }

  if (!plugin) {
    try {
      const handled = await sendTypoSuggestion(conn, raw, chat, prefix, parsed.command)
      if (!handled) {
        console.log(`  \x1b[33m⚠\x1b[0m  Tidak ada saran typo untuk: ${parsed.command}`)
      }
    } catch (err) {
      console.log(`  \x1b[31m✗\x1b[0m  Deteksi typo gagal: ${err?.message || err}`)
    }
    return
  }

  const m = {
    key: raw.key,
    chat,
    sender,
    isGroup,
    text: parsed.text,
    args: parsed.args,
    command: parsed.command,
    pushName: raw.pushName || (isSelf ? 'Owner' : 'Kak'),
    isSelf,
    raw,
    currentMessage: messageContent,
    quoted: messageContent?.extendedTextMessage?.contextInfo?.quotedMessage || null,
    quotedMessage: messageContent?.extendedTextMessage?.contextInfo?.quotedMessage
      ? {
          key: {
            remoteJid: chat,
            fromMe: false,
            id: messageContent.extendedTextMessage.contextInfo.stanzaId,
            participant: messageContent.extendedTextMessage.contextInfo.participant || undefined,
          },
          message: messageContent.extendedTextMessage.contextInfo.quotedMessage,
        }
      : null,
  }

  const executionState = { sent: false }
  m.reply = async (text, options = {}) => {
    const quoted = Object.prototype.hasOwnProperty.call(options, 'quoted')
      ? options.quoted
      : raw
    const result = await sendStyledReply(conn, chat, text, {
      ...options,
      compactDecorated: true,
      originalMessage: quoted === false ? null : quoted,
      mentions: options?.mentions || [],
    })
    executionState.sent = true
    return result
  }

  const styledBase = createStyledConnection(conn, m)
  const styledConn = new Proxy(styledBase, {
    get(target, property, receiver) {
      if (property === 'sendMessage') {
        return async (jid, content, options = {}) => {
          const result = await target.sendMessage(jid, content, options)
          executionState.sent = true
          return result
        }
      }
      const value = Reflect.get(target, property, receiver)
      if (typeof value === 'function') return value.bind(target)
      return value
    },
  })
  const statusContext = { command: parsed.command, args: parsed.args, text: parsed.text, isGroup: m.isGroup, isSelf, sender, chat, message: m }
  const premiumRequired = isPremiumCommand(plugin, statusContext)
  const ownerRequired = isOwnerCommand(plugin, statusContext)
  const groupRequired = isGroupCommand(plugin, statusContext)
  const limitRequired = isLimitCommand(plugin, statusContext)
  const ownerUser = ownerRequired || premiumRequired || limitRequired ? await isOwner(sender, conn) : false

  await touchUser(sender, m.pushName)

  printCommandLog({
    pushName: m.pushName,
    sender,
    message: text,
    command: parsed.command,
    isGroup: m.isGroup,
    chat,
  })

  if (parsed.command === 'menu') {
    try {
      await conn.sendMessage(chat, { react: { text: '🤖', key: raw.key } })
    } catch (err) {
      console.log(`  \x1b[33m⚠\x1b[0m  Gagal mengirim reaction .menu: ${err.message}`)
    }
  }

  if (ownerRequired && !ownerUser) {
    await sendStyledReply(conn, chat, 'Perintah ini khusus untuk owner bot.', { originalMessage: raw })
    return
  }

  if (groupRequired && !m.isGroup) {
    await sendGroupOnlyReply(conn, chat, 'Perintah ini hanya bisa dipakai di dalam group.', raw)
    return
  }

  if (premiumRequired) {
    const premiumUser = ownerUser || await isUserPremium(sender)
    if (!premiumUser) {
      await sendStyledReply(conn, chat, 'Perintah ini khusus untuk pengguna premium.', { originalMessage: raw })
      return
    }
  }

  const limitModeActive = limitsEnabled(settings)
  const bypassLimit = ownerUser || m.isSelf || !limitRequired || !limitModeActive
  let reservationId = null
  let limitState = 'inactive'

  m.limit = {
    get active() { return Boolean(reservationId) },
    get state() { return limitState },
    success() {
      if (!reservationId || limitState !== 'reserved') return false
      limitState = 'confirmed'
      return true
    },
    fail() {
      if (!reservationId || limitState !== 'reserved') return false
      limitState = 'failed'
      return true
    },
  }

  if (!bypassLimit) {
    const reservation = await reserveUserLimit(sender)
    if (!reservation) {
      await sendStyledReply(conn, chat, 'Limit kamu sudah habis. Silakan tunggu sampai limit direset 24 jam setelah grant terakhir.', { originalMessage: raw })
      return
    }
    reservationId = reservation.id
    limitState = 'reserved'
  }

  try {
    const contextOwner = ownerUser || m.isSelf || await isOwner(sender, conn)
    const pluginContext = {
      conn: styledConn,
      rawConn: conn,
      usedPrefix: prefix,
      prefix,
      settings,
      command: parsed.command,
      args: parsed.args,
      text: parsed.text,
      isGroup: m.isGroup,
      isOwner: contextOwner,
      isSelf: m.isSelf,
      sender,
      chat,
    }
    const executePlugin = () => plugin(m, pluginContext)
    const result = plugin?.category === 'rpg'
      ? await withRpgLocks((() => {
          const locks = [`user:${sender}`]
          try {
            const rpgUser = getRpgUser(sender)
            if (rpgUser?.rpg?.guildId) locks.push(`guild:${rpgUser.rpg.guildId}`)
          } catch {
          }
          return locks
        })(), executePlugin)
      : await executePlugin()

    if (reservationId) {
      const metadataLimitCommit = plugin?.limitCommit || null
      const sourceRequiresManual = /(?:setTimeout|setInterval|\.then\s*\(|void\s+|queueMicrotask)/.test(Function.prototype.toString.call(plugin))
      const manualCommit = metadataLimitCommit === 'manual' || sourceRequiresManual
      const explicitFailure = result?.success === false || result?.status === false || limitState === 'failed'
      const explicitSuccess = result?.success === true || result?.status === true || limitState === 'confirmed'
      const executionEvidence = executionState.sent || result !== undefined

      if (explicitFailure || (manualCommit && !explicitSuccess) || (!manualCommit && !executionEvidence)) {
        await releaseUserLimit(reservationId, sender)
        reservationId = null
        limitState = 'released'
        return
      }

      const committed = await commitUserLimit(reservationId, sender)
      reservationId = null
      limitState = committed ? 'committed' : 'released'
      if (!committed) return
      await sendStyledReply(
        conn,
        chat,
        [
          '╭─〔 *LIMIT TERPAKAI* 〕',
          '│ Fitur berhasil digunakan.',
          '│ 1 limit telah digunakan.',
          `│ Sisa limit anda : ${committed.limit}`,
          '╰────────────',
        ].join('\n'),
        { originalMessage: raw }
      )
    }
  } catch (err) {
    if (reservationId) {
      await releaseUserLimit(reservationId, sender)
      reservationId = null
      limitState = 'released'
    }
    console.log(`  \x1b[31m✗\x1b[0m  Error di plugin "${parsed.command}": ${err.message}`)
    if (!executionState.sent) {
      await sendStyledReply(
        conn,
        chat,
        'Terjadi kesalahan saat menjalankan perintah ini. Silakan coba lagi beberapa saat.',
        { originalMessage: raw }
      )
    }
  }

}

function getContextInfoFromContent(messageContent) {
  return (
    messageContent?.extendedTextMessage?.contextInfo ||
    messageContent?.imageMessage?.contextInfo ||
    messageContent?.videoMessage?.contextInfo ||
    null
  )
}

function getMentionedJidsFromContent(messageContent) {
  const ctx = getContextInfoFromContent(messageContent)
  return Array.isArray(ctx?.mentionedJid) ? ctx.mentionedJid : []
}

const AFK_COMMANDS = new Set(['afk', 'away', 'brb'])

async function handleAfkCheck(conn, chat, sender, messageContent, command) {
  const afkData = getAfk(sender)
  if (afkData) {
    const isAfkCommand = AFK_COMMANDS.has(String(command || '').toLowerCase())
    if (!isAfkCommand) {
      removeAfk(sender)
      const duration = formatAfkDuration(Date.now() - afkData.since)
      await sendStyledReply(
        conn,
        chat,
        [
          '╭─〔 AFK 〕',
          '│',
          `│ @${sender.split('@')[0]} sudah kembali.`,
          `│ Durasi AFK : *${duration}*`,
          '╰──────────────',
        ].join('\n'),
        { mentions: [sender] }
      )
    }
  }

  const mentioned = getMentionedJidsFromContent(messageContent)
  for (const jid of mentioned) {
    if (jid === sender) continue
    const mentionedAfk = getAfk(jid)
    if (!mentionedAfk) continue
    const duration = formatAfkDuration(Date.now() - mentionedAfk.since)
    await sendStyledReply(
      conn,
      chat,
      [
        '╭─〔 AFK 〕',
        '│',
        `│ @${jid.split('@')[0]} sedang AFK.`,
        `│ Alasan : *${mentionedAfk.reason}*`,
        `│ Sejak  : *${duration} yang lalu*`,
        '╰──────────────',
      ].join('\n'),
      { mentions: [jid] }
    )
  }
}

export default { attachMessageRouter }
