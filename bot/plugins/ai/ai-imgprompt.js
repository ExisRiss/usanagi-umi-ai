// • Image to prompt 
// • Type : Plugins ESM 
import axios from "axios"
import FormData from "form-data"
import fs from "fs"

let handler = async (m, { conn }) => {
  let q = m.quoted?.mimetype ? m.quoted : m
  if (!q.mimetype?.includes("image")) return conn.reply(m.chat, "🍭 Kirim atau reply gambar!", m)

  let img = await q.download?.()
  if (!img) return conn.reply(m.chat, "🍬 Gagal ambil gambar", m)

  try {
    const form = new FormData()
    form.append("file", img, "img.jpg")

    const res = await axios.post("https://be.neuralframes.com/clip_interrogate/", form, {
      headers: {
        ...form.getHeaders(),
        "Authorization": "Bearer GANTI-DENGAN-TOKEN-LAYANAN",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10)",
        "Referer": "https://www.neuralframes.com/tools/image-to-prompt"
      }
    })

    conn.reply(m.chat, res.data?.caption || res.data?.prompt || "🍬 Tidak ada prompt ditemukan", m)
  } catch (e) {
    conn.reply(m.chat, "❌ Yahh error: " + e.message, m)
  }
}

handler.help = ["imgprompt"]
handler.tags = ["ai"]
handler.command = /^imgprompt$/i
handler.limit = true 
handler.register = true 

export default handler