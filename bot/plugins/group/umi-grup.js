/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
  if (!m.chat?.endsWith('@g.us')) return m.reply('Fitur ini hanya untuk grup.')

  const sub = String(args[0] || '').toLowerCase()
  const usage = `👥 *UMI GRUP — Umi Usanagi AI*\n\n${usedPrefix + command} info — lihat info grup\n${usedPrefix + command} tutup — hanya admin yang bisa kirim pesan\n${usedPrefix + command} buka — semua anggota bisa kirim pesan\n\nPerintah tutup/buka butuh kamu dan bot sama-sama admin.`
  if (!sub) return m.reply(usage)

  if (sub === 'info') {
    const meta = await conn.groupMetadata(m.chat).catch(() => null)
    if (!meta) return m.reply('Gagal membaca info grup.')
    const admins = (meta.participants || []).filter(p => p.admin).length
    const created = meta.creation ? new Date(meta.creation * 1000).toLocaleDateString('id-ID') : '-'
    return m.reply(
      `👥 *${meta.subject || 'Grup'}*\n\n👤 Anggota: ${(meta.participants || []).length}\n🛡️ Admin: ${admins}\n📅 Dibuat: ${created}\n🔒 Mode: ${meta.announce ? 'hanya admin (tertutup)' : 'semua anggota (terbuka)'}\n\n_Umi Grup — Umi Usanagi AI_`,
    )
  }

  if (sub === 'tutup' || sub === 'buka') {
    if (!isAdmin && !isOwner) return m.reply('Hanya admin grup yang bisa memakai perintah ini.')
    const announce = sub === 'tutup'
    try {
      await conn.groupSettingUpdate(m.chat, announce ? 'announcement' : 'not_announcement')
    } catch {
      return m.reply('Gagal mengubah pengaturan. Pastikan bot adalah admin grup.')
    }
    return m.reply(announce
      ? '🔒 Grup *ditutup*: hanya admin yang bisa mengirim pesan.'
      : '🔓 Grup *dibuka*: semua anggota bisa mengirim pesan.')
  }

  return m.reply(usage)
}

handler.help = ['umigrup <info|buka|tutup>']
handler.tags = ['group']
handler.category = 'group'
handler.command = /^(umigrup|grupumi)$/i
handler.group = true
handler.description = 'Info dan buka/tutup grup (Umi Usanagi AI)'

export default handler
