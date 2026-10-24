
const handler = async (m, { rawConn, usedPrefix }) => {
  const text = String(m.text || '').trim()
  if (!text) {
    await m.reply(`💬 Gunakan format *${usedPrefix}readmore teks awal|teks tersembunyi*.`)
    return
  }

  const [left = '', ...rest] = text.split('|')
  const right = rest.join('|')
  const readmore = '\u200E'.repeat(4001)
  const output = `${left}${readmore}${right}`

  try {
    await rawConn.sendMessage(m.chat, { text: output }, { quoted: m.raw })
    return { status: true }
  } catch {
    await m.reply(output)
    return { status: true }
  }
}

handler.command = /^(readmore|selengkapnya|spoiler)$/i
handler.help = ['readmore', 'selengkapnya', 'spoiler']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Membuat teks dengan format baca selengkapnya.'
handler.usage = '.readmore <teks_awal>|<teks_akhir>'
handler.example = '.readmore Hai|Ini teks tersembunyi'
handler.limit = false
handler.premiumOnly = false

export default handler
