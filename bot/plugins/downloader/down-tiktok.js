import fetch from 'node-fetch'

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

    const regex =
      /(https:\/\/(vt|vm)\.tiktok\.com\/[^\s]+|https:\/\/www\.tiktok\.com\/@[\w.-]+\/video\/\d+)/

    let url = input.match(regex)?.[0]

    let data

    // jika link langsung
    if (url) {

      let result = await getTikTok(url)

      if (!result) {
        return m.reply('❌ Semua API TikTok gagal.')
      }

      data = result

    } 
    
    // jika search
    else {

      let search = await (
        await fetch(
          `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(input)}&count=1&cursor=0&web=1&hd=1`
        )
      ).json()


      let video = search?.data?.videos?.[0]


      if (!video) {
        return m.reply(
          `❌ Hasil tidak ditemukan untuk "${input}"`
        )
      }


      let result = await getTikTok(
        `https://www.tiktok.com/@${video.author.unique_id}/video/${video.video_id}`
      )


      if (!result) {
        return m.reply('❌ Gagal mengambil hasil search.')
      }


      data = result
    }



    /*
    ============================
        TIKTOK PHOTO
    ============================
    */

    let images =
      data.images ||
      data.image ||
      data.photo ||
      data.images_url


    if (images && images.length) {


      for (let i = 0; i < images.length; i++) {


        await conn.sendFile(
          m.chat,
          images[i],
          '',
          i === 0
            ?
`🖼️ *TIKTOK PHOTO*

> Judul : ${data.title || '-'}
> Uploader : ${getAuthor(data)}
> Total Foto : ${images.length}
> Views : ${formatNumber(data.play_count)}`
            :
            '',
          m
        )


        await delay(3000)

      }


      return
    }



    /*
    ============================
        TIKTOK VIDEO
    ============================
    */


    let videoUrl =
      data.play ||
      data.video ||
      data.no_watermark ||
      data.play_url ||
      data.video_url



    if (videoUrl) {


      await conn.sendFile(
        m.chat,
        videoUrl,
        'tiktok.mp4',
`
🎬 *TIKTOK VIDEO*

> Judul : ${data.title || '-'}
> Uploader : ${getAuthor(data)}
> Durasi : ${formatDuration(data.duration)}
> Views : ${formatNumber(data.play_count)}
`,
        m
      )


    }



    /*
    ============================
          AUDIO
    ============================
    */


    let audio =
      data.music_info?.play ||
      data.music ||
      data.audio ||
      data.music_url



    if (audio) {


      await conn.sendMessage(
        m.chat,
        {
          audio: {
            url: audio
          },
          mimetype: 'audio/mpeg',
          fileName:
            `${data.title || 'tiktok'}.mp3`
        },
        {
          quoted: m
        }
      )


    }



  } catch (e) {

    console.error(e)

    m.reply(
      '❌ Terjadi kesalahan saat download TikTok.'
    )

  }
}




// Legacy search/photo downloader. Keep aliases distinct so it cannot race
// the maintained Usanagi TikTok downloader on /tt, /ttdl, or /tiktok.
handler.help = [
  'ttlegacy',
  'tiktoklegacy'
]

handler.tags = [
  'downloader'
]

handler.command =
/^(ttlegacy|tiktoklegacy)$/i

handler.limit = true


export default handler




// ===============================
// GET TIKTOK WITH FALLBACK
// ===============================

async function getTikTok(url) {


  // PRIMARY : TIKWM

  try {


    let res = await (
      await fetch(
        `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`
      )
    ).json()



    if (res?.data) {


      return res.data

    }


  } catch {}




  // FALLBACK : SIPUTZX


  try {


    let res = await (
      await fetch(
        `https://api.siputzx.my.id/api/d/tiktok?url=${encodeURIComponent(url)}`
      )
    ).json()



    if (res?.data) {


      let d = res.data


      return {

        title:
          d.title ||
          d.desc,


        play_count:
          d.stats?.playCount ||
          d.play_count ||
          0,


        author:
          d.author,


        duration:
          d.duration,


        play:
          d.video ||
          d.no_watermark ||
          d.play,


        music:
          d.music ||
          d.audio,


        images:
          d.images ||
          d.photo ||
          d.images_url

      }


    }



  } catch {}



  return null

}





function getAuthor(data) {

  return (
    data.author?.nickname ||
    data.author?.unique_id ||
    data.author ||
    '-'
  )

}





function formatNumber(num = 0) {

  return Number(num)
    .toLocaleString()

}





function formatDuration(sec = 0) {


  sec = Number(sec)


  const m =
    Math.floor(sec / 60)
      .toString()
      .padStart(2, '0')


  const s =
    Math.floor(sec % 60)
      .toString()
      .padStart(2, '0')


  return `${m}:${s}`

}





const delay =
ms =>
new Promise(
  resolve =>
  setTimeout(resolve, ms)
)