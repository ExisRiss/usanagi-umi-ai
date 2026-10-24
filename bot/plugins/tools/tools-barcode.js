let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`Contoh:\n${usedPrefix + command} 8991234567890`)

  try {
    const url = `https://barcodeapi.org/api/128/${encodeURIComponent(text)}`

    await conn.sendFile(
      m.chat,
      url,
      'barcode.png',
      `📦 Barcode:\n${text}`,
      m
    )
  } catch (e) {
    m.reply('Gagal membuat barcode.')
  }
}

handler.help = ['barcode <teks>']
handler.tags = ['tools']
handler.command = /^barcode$/i
handler.limit = true

export default handler