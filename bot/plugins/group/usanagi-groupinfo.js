import { groupInfoHtml, sendRichInfo } from '../../lib/rich-info-cards.js'

const handler = async (m, { conn, usedPrefix = '.' }) => {
  if (!m.isGroup || !String(m.chat || '').endsWith('@g.us')) return m.reply('Info grup hanya bisa dibuka dari dalam grup itu sendiri.')
  let metadata
  try { metadata = await conn.groupMetadata(m.chat) }
  catch { return m.reply('Informasi grup belum bisa dimuat dari WhatsApp. Coba lagi sebentar.') }
  const members = Array.isArray(metadata.participants) ? metadata.participants : []
  const admins = members.filter(p=>p.admin || p.isAdmin || p.isSuperAdmin).length
  const fallback = `${metadata.subject || 'Grup WhatsApp'}\nAnggota: ${members.length}\nAdmin: ${admins}\nPesan: ${metadata.announce ? 'hanya admin' : 'semua anggota'}\n\n${metadata.desc || 'Belum ada deskripsi.'}`
  return sendRichInfo(conn,m,groupInfoHtml(metadata,usedPrefix),'UMI · INFO GRUP',fallback)
}
handler.command = /^(groupinfo|infogrup|infogroup|grupinfo)$/i
handler.help = ['groupinfo', 'infogrup', 'infogroup']
handler.tags = ['group']
handler.description = 'Kartu rich HTML info grup, jumlah anggota/admin, pengaturan dan deskripsi di pesan WhatsApp'
handler.groupOnly = true
handler.group = true
export default handler
