/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.chat?.endsWith('@g.us')) return m.reply('Fitur ini hanya untuk grup.')

  const usage = `🗳️ *UMI POLLING — Umi Usanagi AI*\n\nContoh:\n${usedPrefix + command} Makan siang apa? | Nasi Padang | Mie Ayam | Bakso\n\nMaksimal 12 pilihan, satu jawaban per orang.`
  if (!text) return m.reply(usage)

  const [question, ...optionParts] = text.split('|').map(s => s.trim()).filter(Boolean)
  const options = optionParts.flatMap(part => part.split(',').map(s => s.trim()).filter(Boolean))

  if (!question || options.length < 2) return m.reply(usage)
  if (options.length > 12) return m.reply('Pilihan terlalu banyak (maksimal 12).')
  if (question.length > 255 || options.some(o => o.length > 100)) return m.reply('Pertanyaan maks 255 karakter, tiap pilihan maks 100 karakter.')

  await conn.sendMessage(
    m.chat,
    { poll: { name: question, values: options, selectableCount: 1 } },
    { quoted: m },
  )
  return m.reply('🗳️ Polling terkirim. Ketuk untuk memilih!')
}

handler.help = ['umipolling <pertanyaan> | <opsi1> | <opsi2>']
handler.tags = ['group']
handler.category = 'group'
handler.command = /^(umipolling|pollingumi)$/i
handler.group = true
handler.description = 'Buat polling native WhatsApp di grup (Umi Usanagi AI)'

export default handler
