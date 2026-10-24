
import { getGroupParticipant, isGroupAdmin } from '../../lib/awang-aksesgrub.js'
import { isOwner } from '../../lib/awang-cekakses.js'

const sessions = globalThis.__umiVoteKickSessions || new Map()
globalThis.__umiVoteKickSessions = sessions
const DURATION = 2 * 60 * 1000

function mentionOf(m) {
  return m.mentionedJid?.[0] || m.quoted?.sender || null
}

async function finish(groupId, conn, reason = 'timeout') {
  const session = sessions.get(groupId)
  if (!session) return
  clearTimeout(session.timer)
  sessions.delete(groupId)
  if (session.yes.size >= session.threshold && session.yes.size > session.no.size) {
    try {
      await conn.groupParticipantsUpdate(groupId, [session.target], 'remove')
      await conn.sendMessage(groupId, {
        text: `✅ Vote selesai. @${session.target.split('@')[0]} dikeluarkan.\n\nSetuju: ${session.yes.size} · Tidak: ${session.no.size}`,
        mentions: [session.target],
      })
    } catch (error) {
      await conn.sendMessage(groupId, { text: `❌ Vote menang, tetapi bot gagal mengeluarkan target: ${error.message}` })
    }
  } else {
    await conn.sendMessage(groupId, {
      text: `⏳ Vote kick ${reason === 'cancelled' ? 'dibatalkan' : 'berakhir tanpa mencapai syarat'}.\n\nSetuju: ${session.yes.size}/${session.threshold} · Tidak: ${session.no.size}`,
    }).catch(() => {})
  }
}

const handler = async (m, { conn, command, text }) => {
  if (!m.isGroup) return m.reply('Fitur ini hanya dapat digunakan di grup.')
  const cmd = command.toLowerCase()

  if (cmd === 'votekick' || cmd === 'vkick') {
    if (!await isGroupAdmin(conn, m.chat, m.sender) && !await isOwner(m.sender, conn)) return m.reply('Hanya admin grup atau owner yang dapat memulai vote kick.')
    if (sessions.has(m.chat)) return m.reply('Masih ada vote kick aktif di grup ini.')
    const target = mentionOf(m)
    if (!target) return m.reply('Tag atau reply pengguna yang akan dipilih.')
    if (target === m.sender || target === conn.user?.id) return m.reply('Target vote tidak valid.')
    if (await isOwner(target, conn)) return m.reply('Owner bot tidak dapat menjadi target vote.')
    if (await isGroupAdmin(conn, m.chat, target)) return m.reply('Admin grup tidak dapat menjadi target vote.')

    const metadata = await conn.groupMetadata(m.chat)
    if (!await getGroupParticipant(conn, m.chat, target, metadata)) return m.reply('Target bukan anggota grup ini.')
    const eligible = Math.max(1, (metadata.participants || []).length - 1)
    const requested = Number(String(text || '').match(/\b\d+\b/)?.[0])
    const threshold = Math.max(2, Math.min(10, requested || Math.min(5, Math.max(3, Math.ceil(eligible * 0.2)))))
    const session = {
      target,
      initiator: m.sender,
      threshold,
      yes: new Set([m.sender]),
      no: new Set(),
      timer: null,
    }
    session.timer = setTimeout(() => finish(m.chat, conn), DURATION)
    session.timer.unref?.()
    sessions.set(m.chat, session)
    return conn.sendMessage(m.chat, {
      text: `⚖️ *VOTE KICK DIMULAI*\n\nTarget: @${target.split('@')[0]}\nSetuju awal: 1/${threshold}\nWaktu: 2 menit\n\nKetik:\n• /vote yes\n• /vote no\n\nBy AlzRiss - Usanagi Umi AI`,
      mentions: [target, m.sender],
    }, { quoted: m.raw })
  }

  const session = sessions.get(m.chat)
  if (!session) return m.reply('Tidak ada vote kick aktif.')

  if (cmd === 'cancelvotekick') {
    if (m.sender !== session.initiator && !await isGroupAdmin(conn, m.chat, m.sender) && !await isOwner(m.sender, conn)) return m.reply('Hanya pemulai vote, admin, atau owner yang dapat membatalkan.')
    await finish(m.chat, conn, 'cancelled')
    return
  }

  const choice = String(text || '').trim().toLowerCase()
  if (!['yes', 'ya', 'setuju', 'no', 'tidak', 'tolak'].includes(choice)) return m.reply('Gunakan `/vote yes` atau `/vote no`.')
  session.yes.delete(m.sender)
  session.no.delete(m.sender)
  if (['yes', 'ya', 'setuju'].includes(choice)) session.yes.add(m.sender)
  else session.no.add(m.sender)

  await m.reply(`🗳️ Vote dicatat. Setuju: ${session.yes.size}/${session.threshold} · Tidak: ${session.no.size}`)
  if (session.yes.size >= session.threshold) await finish(m.chat, conn)
}

handler.command = /^(votekick|vkick|vote|cancelvotekick)$/i
handler.help = ['votekick @user', 'vote yes/no', 'cancelvotekick']
handler.tags = ['group']
handler.group = true
handler.botAdmin = true
handler.description = 'Vote kick aman dengan batas waktu dan suara unik'

export default handler
