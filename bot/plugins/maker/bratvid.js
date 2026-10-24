import axios from 'axios'

const API_BASE = 'https://apiii-xrina.my.id'

let handler = async (m, { conn, args }) => {
  const text = args.join(' ') || m.quoted?.text

  if (!text) {
    return m.reply(
      `✨ Masukin teks dong!\nContoh: .bratvid halo dunia`
    )
  }

  try {
    await m.react('⏳').catch(() => {})
    const url = `${API_BASE}/maker/bratvid?text=${encodeURIComponent(text)}`

    const { data } = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 60000,
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13) Chrome/140' }
    })

    const buffer = Buffer.from(data)
    if (!buffer.length) throw new Error('API mengembalikan data kosong.')

    await conn.sendSticker(
      m.chat,
      buffer,
      m,
      {
        packname: global.stickpack || global.namebot,
        packpublish: global.stickauth || global.author
      }
    )
    await m.react('✅').catch(() => {})
  } catch (e) {
    console.error('[BRATVID]', e?.message || e)
    await m.react('❌').catch(() => {})
    m.reply(`❌ Gagal membuat bratvid.\n${e?.message || e}`)
  }
}

handler.help = ['bratvid <teks>']
handler.tags = ['sticker']
handler.command = /^bratvid$/i
handler.limit = true

export default handler