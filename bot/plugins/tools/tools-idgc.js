let handler = async (m, { conn, text }) => {
  if (!text) throw 'Masukkan link grup WhatsApp!'

  const match = text.match(/(?:https?:\/\/)?chat\.whatsapp\.com\/([0-9A-Za-z]+)/i)
  if (!match) throw 'Link grup WhatsApp tidak valid!'

  const code = match[1]

  try {
    const info = await conn.groupGetInviteInfo(code)

    const created = info.creation
      ? new Date(info.creation * 1000).toLocaleString('id-ID')
      : '-'

    const caption = `
— INFO GRUP —

❀ Nama: ${info.subject}
❀ ID Grup: ${info.id}
❀ Member: ${info.size || 0}
❀ Dibuat: ${created}
`.trim()

    m.reply(caption)
  } catch (e) {
    console.error(e)
    throw 'Gagal mengambil info grup. Pastikan link invite masih valid.'
  }
}

handler.help = ['cekidgc']
handler.tags = ['tools']
handler.command = /^(cekidgc|idgc)$/i

export default handler