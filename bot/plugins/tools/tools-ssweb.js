import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`乂 *SSWEB / RECORD WEB*

📌 Screenshot:
${usedPrefix + command} https://github.com

🎥 Record video:
${usedPrefix + command} video https://github.com

⚙️ Opsi:
desktop_fhd / desktop / tablet / mobile

Contoh:
${usedPrefix + command} video https://github.com desktop_fhd 8000`)
  }

  try {
    let args = text.trim().split(/\s+/)
    let mode = args[0]?.toLowerCase() === 'video' ? 'video' : 'image'

    if (mode === 'video') args.shift()

    let url = args[0]
    let device = args[1] || 'desktop_fhd'
    let duration = Number(args[2]) || 8000

    if (!url) return m.reply('Masukkan URL website-nya.')
    if (!/^https?:\/\//i.test(url)) url = 'https://' + url

    await m.reply(mode === 'video'
      ? '⏳ Lagi record website jadi video...'
      : '⏳ Lagi screenshot website...'
    )

    if (mode === 'video') {
      let { data } = await axios.post(
        'https://shinana-bentosnap.hf.space/api/record',
        {
          url,
          device,
          duration_ms: duration,
          fps: 30,
          scroll: true,
          dark_mode: false,
          wait_ms: 1500
        },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      )

      let videoUrl =
        data?.url ||
        data?.video ||
        data?.result ||
        data?.output ||
        data?.data?.url

      if (!videoUrl) {
        return m.reply(`Gagal ambil hasil video.\n\n${JSON.stringify(data, null, 2).slice(0, 1000)}`)
      }

      return conn.sendMessage(m.chat, {
        video: { url: videoUrl },
        mimetype: 'video/mp4',
        caption: `乂 *WEB RECORD*\n\n🌐 URL: ${url}\n📱 Device: ${device}\n⏱️ Duration: ${duration}ms`
      }, { quoted: m })
    }

    let { data } = await axios.post(
      'https://shinana-bentosnap.hf.space/api/screenshot',
      {
        url,
        device,
        dark_mode: false,
        wait_ms: 1500
      },
      {
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json'
        },
        timeout: 120000
      }
    )

    let imageUrl =
      data?.url ||
      data?.image ||
      data?.result ||
      data?.output ||
      data?.data?.url

    if (!imageUrl) {
      return m.reply(`Gagal ambil hasil screenshot.\n\n${JSON.stringify(data, null, 2).slice(0, 1000)}`)
    }

    return conn.sendMessage(m.chat, {
      image: { url: imageUrl },
      caption: `乂 *SS WEB*\n\n🌐 URL: ${url}\n📱 Device: ${device}`
    }, { quoted: m })

  } catch (e) {
    m.reply(`Error: ${e.message}`)
  }
}

handler.help = ['ssweb']
handler.tags = ['tools']
handler.command = /^(ssweb|ss|webss|recordweb)$/i
handler.limit = true

export default handler