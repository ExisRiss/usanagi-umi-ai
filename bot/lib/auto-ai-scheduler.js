import { withRealmGate } from './realms/gate.js'
/* By AlzRiss - Usanagi Umi AI
 *
 * Penjadwal perintah Auto-AI.
 *
 * Auto-AI bisa meminta beberapa perintah sekaligus, misalnya "tutup grup lalu
 * buka lagi 5 detik kemudian". Perintah pertama dijalankan oleh handler biasa,
 * sisanya masuk ke modul ini dan dieksekusi tepat waktu tanpa menahan proses
 * pesan (tidak ada `await` panjang di jalur handler).
 *
 * Yang dijaga saat eksekusi:
 *  - plugin diambil ulang dari `global.plugins` (kalau sudah hilang/nonaktif,
 *    tugas dibatalkan dengan pesan jelas);
 *  - metadata grup, status admin pengguna dan admin bot dihitung ULANG, jadi
 *    hak akses tidak bisa "dibekukan" dari waktu perencanaan;
 *  - pesan dikirim tanpa kutipan (key pesan lama bisa sudah kedaluwarsa).
 *
 * Batas praktis: satu tugas maksimal 7 hari, maksimal 200 tugas menunggu.
 * Tidak ada batas jumlah perintah per permintaan (dibatasi 6 oleh planner).
 */

import {
  isGroupAdmin as resolveGroupAdmin,
  isBotAdmin as resolveBotGroupAdmin,
} from './awang-aksesgrub.js'

const MAX_DELAY_MS = 7 * 24 * 60 * 60 * 1000
const MAX_JOBS = 200
const jobs = new Map()
let sequence = 0

function safeNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function shortNotice(conn, chat, text) {
  return conn.sendMessage(chat, { text: String(text).slice(0, 600) }, {}).catch(() => null)
}

export function listScheduled(scope = '') {
  const rows = []
  for (const job of jobs.values()) {
    if (scope && job.scope !== scope) continue
    rows.push({
      id: job.id,
      scope: job.scope,
      chat: job.chat,
      sender: job.sender,
      command: job.command,
      args: job.args,
      plugin: job.pluginName,
      runAt: job.runAt,
      delayMs: Math.max(0, job.runAt - Date.now()),
    })
  }
  return rows.sort((a, b) => a.runAt - b.runAt)
}

export function cancelScheduled(id) {
  const job = jobs.get(String(id || ''))
  if (!job) return false
  clearTimeout(job.timer)
  jobs.delete(job.id)
  return true
}

export function cancelScheduledForChat(chat) {
  let removed = 0
  for (const job of [...jobs.values()]) {
    if (job.chat !== chat) continue
    cancelScheduled(job.id)
    removed += 1
  }
  return removed
}

/**
 * Daftarkan satu perintah untuk dijalankan nanti.
 * @returns {{id:string, runAt:number}}
 */
export function schedulePluginCommand(input = {}) {
  const delayMs = Math.max(0, Math.min(MAX_DELAY_MS, safeNumber(input.delayMs, 0)))
  const chat = String(input.chat || '')
  const command = String(input.command || '').toLowerCase().trim()
  if (!chat || !command) throw new Error('Tujuan atau perintah jadwal tidak lengkap.')
  if (jobs.size >= MAX_JOBS) {
    // Buang tugas paling lama yang sudah lewat 1 jam agar antrean tidak macet.
    const stale = [...jobs.values()].filter(job => job.runAt < Date.now() - 3_600_000).sort((a, b) => a.runAt - b.runAt)[0]
    if (stale) cancelScheduled(stale.id)
    else throw new Error('Antrean jadwal penuh. Tunggu beberapa tugas selesai dulu.')
  }
  sequence += 1
  const id = `ai-${Date.now().toString(36)}-${sequence}`
  const job = {
    id,
    scope: String(input.scope || ''),
    chat,
    sender: String(input.sender || ''),
    pushName: String(input.pushName || 'User'),
    isGroup: Boolean(input.isGroup),
    prefix: String(input.prefix || '.'),
    command,
    args: String(input.args || '').slice(0, 4000),
    pluginName: String(input.pluginName || ''),
    isOwner: Boolean(input.isOwner),
    isPrems: Boolean(input.isPrems),
    botConfig: input.botConfig || {},
    bot: input.bot || {},
    conn: input.conn,
    runAt: Date.now() + delayMs,
  }
  job.timer = setTimeout(() => { runJob(job).catch(() => null) }, delayMs)
  if (typeof job.timer.unref === 'function') job.timer.unref()
  jobs.set(id, job)
  return { id, runAt: job.runAt }
}

function buildScheduledMessage(conn, job, groupMetadata) {
  const text = `${job.prefix}${job.command}${job.args ? ' ' + job.args : ''}`
  const key = {
    remoteJid: job.chat,
    fromMe: false,
    id: `UMIAI${Date.now().toString(36).toUpperCase()}`,
    participant: job.isGroup ? job.sender : undefined,
  }
  const message = {
    key,
    chat: job.chat,
    sender: job.sender,
    chatId: job.chat,
    isGroup: job.isGroup,
    fromMe: false,
    isBaileys: false,
    pushName: job.pushName,
    name: job.pushName,
    text,
    body: text,
    command: job.command,
    prefix: job.prefix,
    args: job.args ? job.args.split(/\s+/).filter(Boolean) : [],
    mentionedJid: [],
    quoted: null,
    messageTimestamp: Math.floor(Date.now() / 1000),
    groupMetadata: groupMetadata || {},
    __autoAIScheduled: true,
    reply(payload, options = {}) {
      const opts = options && typeof options === 'object' ? options : {}
      const body = typeof payload === 'string' ? { text: payload } : { ...payload }
      if (opts.mentions) body.mentions = opts.mentions
      return conn.sendMessage(job.chat, body, {}).catch(() => null)
    },
    react(emoji) {
      return conn.sendMessage(job.chat, { react: { text: String(emoji || ''), key } }).catch(() => null)
    },
  }
  return message
}

async function runJob(job) {
  jobs.delete(job.id)
  const conn = job.conn || global.conn
  if (!conn) return
  if (job.scope && job.conn && global.conn && job.conn !== global.conn) {
    // Sesi jadibot yang sudah diputus: jangan kirim apa pun.
    if (typeof job.conn.ws?.isClosed === 'function' && job.conn.ws.isClosed) return
  }
  try {
    const registered = (global.plugins || {})[job.pluginName]
    if (typeof registered !== 'function' || registered.disabled) {
      await shortNotice(conn, job.chat, `⚠️ Perintah *${job.command}* yang dijadwalkan tidak bisa dijalankan: fiturnya sudah tidak tersedia.`)
      return
    }
    let groupMetadata = {}
    if (job.isGroup) {
      try { groupMetadata = await conn.groupMetadata(job.chat) } catch { groupMetadata = {} }
      if (!groupMetadata || !groupMetadata.subject) {
        await shortNotice(conn, job.chat, `⚠️ Perintah *${job.command}* dibatalkan: data grup tidak bisa dibaca (bot mungkin sudah keluar dari grup).`)
        return
      }
    }
    const participants = groupMetadata.participants || []
    const isAdmin = job.isGroup ? await resolveGroupAdmin(conn, job.chat, job.sender, groupMetadata) : false
    const isBotAdmin = job.isGroup ? await resolveBotGroupAdmin(conn, job.chat, groupMetadata) : false
    if (registered.group && !job.isGroup) return
    if (registered.admin && !isAdmin) {
      await shortNotice(conn, job.chat, `⚠️ Perintah *${job.command}* dibatalkan: kamu bukan admin grup saat jadwal berjalan.`)
      return
    }
    if (registered.botAdmin && !isBotAdmin) {
      await shortNotice(conn, job.chat, `⚠️ Perintah *${job.command}* dibatalkan: bot bukan admin grup saat jadwal berjalan.`)
      return
    }
    if ((registered.owner || registered.rowner) && !job.isOwner) {
      await shortNotice(conn, job.chat, `⚠️ Perintah *${job.command}* dibatalkan: hanya owner yang boleh menjalankannya.`)
      return
    }
    const message = buildScheduledMessage(conn, job, groupMetadata)
    const argsText = job.args || ''
    const extra = {
      conn,
      rawConn: conn,
      command: job.command,
      usedPrefix: job.prefix,
      noPrefix: job.prefix + job.command,
      _args: message.args,
      args: message.args,
      text: argsText,
      match: argsText ? argsText.match(/\S+/g) || [] : [],
      botConfig: job.botConfig,
      botScope: job.scope,
      bot: job.bot,
      settings: (await import('../config/settings.js').catch(() => ({ default: {} }))).default,
      participants,
      groupMetadata,
      user: global.db?.data?.users?.[job.sender] || {},
      chatData: global.db?.data?.chats?.[job.chat] || {},
      isROwner: Boolean(job.isOwner),
      isOwner: Boolean(job.isOwner),
      isRAdmin: Boolean(job.isOwner && job.isGroup && isAdmin),
      isAdmin,
      isBotAdmin,
      isPrems: Boolean(job.isPrems),
      chatUpdate: {},
      __autoAIScheduled: true,
    }
    if (job.pluginName.startsWith('rpg/') || (Array.isArray(registered.tags) && registered.tags.includes('rpg'))) {
      await withRealmGate(() => registered.call(conn, message, extra))
    } else await registered.call(conn, message, extra)
  } catch (error) {
    const reason = String(error?.message || error || 'kesalahan tidak diketahui').slice(0, 200)
    console.error('[AUTO-AI-JADWAL]', job.command, reason)
    await shortNotice(conn, job.chat, `⚠️ Perintah *${job.command}* yang dijadwalkan gagal dijalankan: ${reason}`)
  }
}

export default { schedulePluginCommand, listScheduled, cancelScheduled, cancelScheduledForChat }
