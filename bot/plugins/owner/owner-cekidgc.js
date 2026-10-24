let handler = async (m) => {
  if (!m.isGroup) throw 'Fitur ini hanya bisa dipakai di grup!'

  let id = m.chat
  m.reply(`🆔 *ID Grup:*\n${id}`)
}

handler.help = ['cekidgc']
handler.tags = ['owner']
handler.command = /^cekid(gc|grup)?$/i
handler.owner = true
handler.limit = false

export default handler