let handler = async (m, { conn, text, usedPrefix, command }) => {

  if (!text) {
    return m.reply(`Contoh:
${usedPrefix + command} swim chase atlantic
${usedPrefix + command} https://open.spotify.com/track/xxxx`)
  }

  await m.react('🕒')

  try {
    let link = text

    if (!text.includes('spotify.com')) {
      const searchRes = await fetch(`https://api.zenzxz.my.id/search/spotify?q=${encodeURIComponent(text)}`)
      const search = await searchRes.json()

      if (!search.status || !search.result?.results?.length) {
        throw new Error('No result')
      }

      const first = search.result.results[0]
      link = `https://open.spotify.com/track/${first.id}`
    }

    const dlRes = await fetch(`https://api.zenzxz.my.id/download/spotify?url=${encodeURIComponent(link)}`)
    const dl = await dlRes.json()

    if (!dl.status || !dl.result?.download_url) {
      throw new Error('Download error')
    }

    await conn.sendMessage(m.chat, {
      audio: { url: dl.result.download_url },
      mimetype: 'audio/mpeg',
      contextInfo: {
        externalAdReply: {
          title: dl.result.title,
          body: dl.result.artist,
          thumbnailUrl: dl.result.thumbnail,
          sourceUrl: link,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    await m.react('✅')

  } catch (e) {
    console.error(e)
    await m.react('❌')
    m.reply('Gagal mengambil atau mendownload lagu.')
  }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = /^spotify$/i
handler.limit = true

export default handler