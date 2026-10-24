let handler = async (m, { text, usedPrefix, command, conn }) => {
  try {
    await m.react('✨')

    const input = m.quoted ? m.quoted.text : text
    if (!input) {
      return m.reply(
        `Contoh:\n` +
        `${usedPrefix + command} https://vt.tiktok.com/xxxx\n` +
        `${usedPrefix + command} elaina edit`
      )
    }

    const regex = /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/
    let url = input.match(regex)?.[0]
    let data

    if (url) {
      let res = await (await fetch(`https://www.tikwm.com/api/?url=${url}&hd=1`)).json()
      if (!res?.data) return m.reply('❌ Gagal mengambil data TikTok.')
      data = res.data
    } else {
      let search = await (
        await fetch(
          `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(input)}&count=1&cursor=0&web=1&hd=1`
        )
      ).json()

      let video = search?.data?.videos?.[0]
      if (!video) return m.reply(`❌ Hasil tidak ditemukan untuk "${input}"`)

      let res = await (
        await fetch(
          `https://www.tikwm.com/api/?url=https://www.tiktok.com/@${video.author.unique_id}/video/${video.video_id}&hd=1`
        )
      ).json()

      if (!res?.data) return m.reply('❌ Gagal mengambil data hasil search.')
      data = res.data
    }

    const isPhoto = data.images && data.images.length > 0

    if (isPhoto) {
      for (let i = 0; i < data.images.length; i++) {
        await conn.sendFile(
          m.chat,
          data.images[i],
          '',
          i === 0
            ? `🎌 *TIKTOK PHOTO*

> *Judul*: ${data.title || '-'}
> *Uploader*: ${data.author.nickname || data.author.unique_id}
> *Total Foto*: ${data.images.length}
> *Views*: ${formatNumber(data.play_count)}`
            : '',
          m
        )

        await delay(3000)
      }
    } else {
      await conn.sendFile(
        m.chat,
        data.play,
        '',
        `🎌 *TIKTOK VIDEO*

> *Judul*: ${data.title || '-'}
> *Uploader*: ${data.author.nickname || data.author.unique_id}
> *Durasi*: ${formatDuration(data.duration)}
> *Views*: ${formatNumber(data.play_count)}`,
        m
      )

      if (data.music_info?.play) {
        await conn.sendMessage(
          m.chat,
          {
            audio: { url: data.music_info.play },
            mimetype: 'audio/mpeg',
            fileName: `${data.title || 'tiktok'}.mp3`
          },
          { quoted: m }
        )
      }
    }

  } catch (e) {
    console.error(e)
    m.reply('❌ Terjadi kesalahan.')
  }
}

// Version 3 remains available via explicit aliases and no longer competes with the primary downloader.
handler.help = ['tt3', 'tiktok3']
handler.tags = ['downloader']
handler.command = /^(tt3|tiktok3)$/i
handler.limit = true

export default handler

function formatNumber(num = 0) {
  return num.toLocaleString()
}

function formatDuration(sec = 0) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0')
  const s = Math.floor(sec % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

const delay = ms => new Promise(res => setTimeout(res, ms))