/*
get pp wa 
*/
import axios from "axios"

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(
    `*❌ Masukkan nomor!*\n\nContoh:\n${usedPrefix + command} 628xxxx`
  )

  let nomor = text.replace(/[^0-9]/g, '')
  if (isNaN(nomor)) return m.reply("*❌ Nomor tidak valid!*")

  try {
    let { data } = await axios.get("https://wa-api.b-cdn.net/wa-dp/", {
      headers: {
        'accept': '*/*',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'origin': 'https://snaplytics.io',
        'referer': 'https://snaplytics.io/',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
      },
      params: { phone: nomor }
    })

    if (data?.profilePicture) {
      await conn.sendFile(
        m.chat,
        data.profilePicture,
        "pp.jpg",
        `✅ Foto profil (via API): ${nomor}`,
        m
      )
      return
    }

    let jid = nomor + "@s.whatsapp.net"
    let pp = await conn.profilePictureUrl(jid, 'image').catch(_ => null)

    if (pp) {
      await conn.sendFile(
        m.chat,
        pp,
        "pp.jpg",
        `✅ Foto profil (via WhatsApp): ${nomor}`,
        m
      )
    } else {
      m.reply("❌ Nomor tidak punya foto profil / tidak terdaftar di WhatsApp.")
    }

  } catch (e) {
    console.error(e)
    m.reply("❌ Terjadi kesalahan saat ambil foto profil.")
  }
}

handler.help = ['ppwa <nomor>']
handler.tags = ['tools']
handler.command = /^ppwa$/i
handler.limit = false
handler.premium = false

export default handler