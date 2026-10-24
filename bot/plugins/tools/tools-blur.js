import axios from 'axios'
import FormData from 'form-data'

let handler = async (m, { conn, usedPrefix, command }) => {
  try {
    await m.react('🌫️')

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime) {
      return m.reply(
        `Reply/kirim gambar dengan caption\n\n` +
        `Contoh:\n${usedPrefix + command}`
      )
    }

    let media = await q.download()

    // 🔥 upload ke uguu
    let form = new FormData()
    form.append('files[]', media, 'image.jpg')

    let res = await axios.post('https://uguu.se/upload.php', form, {
      headers: form.getHeaders()
    })

    let url = res.data.files[0].url

    // 🔥 API Popcat Blur
    let api = `https://api.popcat.xyz/v2/blur?image=${encodeURIComponent(url)}`

    await conn.sendFile(m.chat, api, 'blur.png', '🌫️ Blur done', m)

  } catch (e) {
    console.error(e)
    m.reply('❌ Error bang')
  }
}

handler.help = ['blur']
handler.tags = ['tools']
handler.command = ['blur']

export default handler