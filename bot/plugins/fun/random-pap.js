import fetch from 'node-fetch'

let handler = async (m, { conn }) => {
  try {
    await m.react('📸')

    const apiUrl = 'https://api.nexadev.my.id/api/random/pap'
    const res = await fetch(apiUrl)

    if (!res.ok) throw 'Gagal mengambil PAP dari server.'

    // Karena API merespon dengan gambar langsung, kita ambil arrayBuffer/buffer-nya
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    await conn.sendMessage(
      m.chat,
      {
        image: buffer,
        caption: '📸 *Random PAP*'
      },
      { quoted: m }
    )

  } catch (e) {
    console.error(e)
    m.reply(`❌ ${e.message || e}`)
  }
}

handler.help = ['pap']
handler.tags = ['internet', 'random']
handler.command = /^pap$/i
handler.limit = true

export default handler