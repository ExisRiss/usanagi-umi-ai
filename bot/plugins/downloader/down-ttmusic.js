let handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    await m.react('🎵')

    const rawInput = m.quoted?.text || text || ''
    const input = cleanInput(rawInput)

    if (!input) {
      return m.reply(
        `Contoh:\n` +
        `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
        `${usedPrefix + command} elaina edit`
      )
    }

    const regex = /https?:\/\/(?:www\.|vt\.|vm\.|m\.)?tiktok\.com\/[^\s]+/i
    const url = input.match(regex)?.[0]
    let data

    if (url) {
      const json = await getJson(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
      )

      if (!json?.data) return m.reply('❌ Gagal mengambil data TikTok.')
      data = json.data
    } else {
      const search = await getJson(
        `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(input)}&count=1&cursor=0&web=1`
      )

      const video = search?.data?.videos?.[0]
      if (!video) return m.reply(`❌ Hasil tidak ditemukan untuk "${input}"`)

      const json = await getJson(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(`https://www.tiktok.com/@${video.author.unique_id}/video/${video.video_id}`)}&hd=1`
      )

      if (!json?.data) return m.reply('❌ Gagal mengambil data hasil pencarian.')
      data = json.data
    }

    const audioUrl =
      data.music_info?.play ||
      data.music ||
      data.music_info?.audio

    if (!audioUrl) return m.reply('❌ Audio TikTok tidak ditemukan.')

    const audioBuffer = await getBuffer(audioUrl)

    if (!audioBuffer?.length) {
      return m.reply('❌ Buffer audio kosong.')
    }

    await conn.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${cleanFileName(data.title || 'tiktok')}.mp3`,
        ptt: false
      },
      { quoted: m }
    )

    await m.react('✅')
  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan saat mengambil audio TikTok.')
  }
}

handler.help = ['ttmp3']
handler.tags = ['downloader']
handler.command = /^(ttmp3|tiktokmp3)$/i
handler.limit = true

export default handler

async function getJson(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json,text/plain,*/*',
      'Referer': 'https://www.tikwm.com/'
    }
  })

  if (!res.ok) throw new Error(`Request gagal: ${res.status} ${res.statusText}`)
  return await res.json()
}

async function getBuffer(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': '*/*',
      'Referer': 'https://www.tikwm.com/'
    }
  })

  if (!res.ok) throw new Error(`Audio gagal: ${res.status} ${res.statusText}`)
  return Buffer.from(await res.arrayBuffer())
}

function cleanInput(str = '') {
  return String(str)
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function cleanFileName(name = 'tiktok') {
  return String(name)
    .replace(/[\\/:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 50) || 'tiktok'
}