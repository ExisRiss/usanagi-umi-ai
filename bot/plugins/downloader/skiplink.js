import axios from 'axios'

const handler = async (m, { text }) => {
  if (!text) {
    return m.reply(`Contoh:\n.skiplink https://sfl.gl/`)
  }

  try {
    const { data } = await axios.get(
      'https://free-restapi.biz.id/api/skiplink',
      {
        params: {
          url: text,
          apikey: 'KaaOffc2'
        }
      }
    )

    if (!data.success) {
      throw new Error(data.info?.message || 'Gagal bypass')
    }

    const hasil = data.directUrl

    await m.reply(
`✅ *Bypass Berhasil*

📌 Type: ${data.type || '-'}
🔗 Direct URL:
${hasil}`
    )

  } catch (err) {
    console.error(err)
    m.reply(`❌ Error: ${err.message}`)
  }
}

handler.help = ['skiplink <url>']
handler.tags = ['tools']
handler.command = ['skiplink']

export default handler