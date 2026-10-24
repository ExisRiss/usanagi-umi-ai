/*
TikTok Downloader
Base : https://www.tiktok.com
Support Image slide dan video
 * By AlzRiss - Usanagi Umi AI
ESM Plugin Version
*/

import https from 'https'
import zlib from 'zlib'

const agent = new https.Agent({
  keepAlive: true
})

function request(url, { method = 'GET', headers = {}, body = null } = {}) {
  return new Promise((resolve, reject) => {
    try {
      const u = new URL(url)

      const opts = {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method,
        headers: body
          ? { ...headers, 'content-length': Buffer.byteLength(body) }
          : headers,
        agent,
        maxHeaderSize: 1048576
      }

      const req = https.request(opts, res => {
        // Redirect handler
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const newHeaders = { ...headers }
          delete newHeaders.host

          return resolve(
            request(res.headers.location, {
              method,
              headers: newHeaders,
              body
            })
          )
        }

        const chunks = []
        const encoding = res.headers['content-encoding']
        let stream = res

        if (encoding === 'gzip') {
          stream = res.pipe(zlib.createGunzip())
        } else if (encoding === 'br') {
          stream = res.pipe(zlib.createBrotliDecompress())
        } else if (encoding === 'deflate') {
          stream = res.pipe(zlib.createInflate())
        }

        stream.on('data', chunk => chunks.push(chunk))
        stream.on('end', () => {
          resolve({
            text: Buffer.concat(chunks).toString('utf8'),
            headers: res.headers,
            status: res.statusCode
          })
        })
        stream.on('error', reject)
      })

      req.on('error', reject)
      if (body) req.write(body)
      req.end()
    } catch (error) {
      reject(error)
    }
  })
}

function extractItemStruct(html) {
  // api-data
  const apiMatch = html.match(/<script id="api-data"[^>]*>([\s\S]*?)<\/script>/)
  if (apiMatch) {
    try {
      const j = JSON.parse(apiMatch[1])
      const s = j?.videoDetail?.itemInfo?.itemStruct || j?.itemInfo?.itemStruct

      if (s) return s

      if (j?.ItemModule) {
        const firstId = Object.keys(j.ItemModule)[0]
        if (firstId && j.ItemModule[firstId]) {
          return j.ItemModule[firstId]
        }
      }
    } catch {}
  }

  // Universal Data
  const uniMatch = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/)
  if (uniMatch) {
    try {
      const j = JSON.parse(uniMatch[1])
      const defaultScope = j?.__DEFAULT_SCOPE__ || {}

      for (const key of Object.keys(defaultScope)) {
        const s = defaultScope[key]?.itemInfo?.itemStruct
        if (s) return s
      }
    } catch {}
  }

  return null
}

async function tiktok(url) {
  const { text, status, headers } = await request(url, {
    headers: {
      'sec-ch-ua': '"Mises";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'upgrade-insecure-requests': '1',
      'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-user': '?1',
      'sec-fetch-dest': 'document',
      'accept-encoding': 'gzip, deflate, br',
      'accept-language': 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6',
      priority: 'u=0, i'
    }
  })

  if (status >= 400) throw new Error(`TikTok mengembalikan HTTP ${status}`)

  const detail = extractItemStruct(text)
  if (!detail) {
    throw new Error('Data TikTok tidak ditemukan. Link mungkin tidak valid atau TikTok mengubah struktur halaman.')
  }

  const isImage = !!detail.imagePost
  let download = []

  if (isImage) {
    download = (detail.imagePost.images || []).reduce((acc, img) => {
      return acc.concat(img?.imageURL?.urlList || [])
    }, [])
  } else {
    download = [detail.video?.downloadAddr, detail.video?.playAddr].filter(Boolean)

    // Player API
    if (detail.id) {
      try {
        const pUrl = `https://www.tiktok.com/player/api/v1/items?item_ids=${detail.id}`
        const pResponse = await request(pUrl)
        const pJson = JSON.parse(pResponse.text)
        const directUrl = pJson.items?.[0]?.video_info?.url_list?.[0]

        if (directUrl) download.unshift(directUrl)
      } catch {}
    }
  }

  return {
    cookies: (headers['set-cookie'] || []).map(c => c.split(';')[0]).join('; '),
    id: detail.id || detail.aweme_id || null,
    isVideo: !isImage,
    title: detail.desc || detail.suggestedWords?.[0] || '',
    region: detail.locationCreated || null,
    duration: `${detail.video?.duration || detail.music?.duration || 0} second`,
    cover: detail.video?.cover || detail.video?.originCover || null,
    stats: {
      like: detail.stats?.diggCount || 0,
      views: detail.stats?.playCount || 0,
      share: detail.stats?.shareCount || 0,
      comment: detail.stats?.commentCount || 0,
      collect: detail.stats?.collectCount || 0
    },
    download,
    author: {
      id: detail.author?.id || '',
      secUid: detail.author?.secUid || '',
      username: detail.author?.uniqueId || '',
      nickname: detail.author?.nickname || '',
      avatar: detail.author?.avatarLarger || detail.author?.avatarMedium || detail.author?.avatarThumb || null,
      verified: detail.author?.verified || false,
      followers: detail.authorStats?.followerCount || detail.author?.followerCount || 0,
      following: detail.authorStats?.followingCount || detail.author?.followingCount || 0,
      like: detail.authorStats?.heartCount || detail.author?.heartCount || 0,
      videoCount: detail.authorStats?.videoCount || detail.author?.videoCount || 0
    },
    music: {
      id: detail.music?.id || null,
      title: detail.music?.title || '',
      author: detail.music?.authorName || '',
      thumbnail: detail.music?.coverLarge || detail.music?.coverMedium || detail.music?.coverThumb || null,
      duration: `${detail.music?.duration || 0} second`,
      url: detail.music?.playUrl || null
    }
  }
}

/* ============================================================
   HANDLER
============================================================ */

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    const input = m.quoted?.text || text

    if (!input) {
      return m.reply(`Contoh:\n${usedPrefix + command} https://vt.tiktok.com/xxxxx`)
    }

    if (!/https?:\/\/(?:www\.|vt\.|vm\.)?tiktok\.com\//i.test(input)) {
      return m.reply('❌ Link TikTok tidak valid.')
    }

    await m.react('⏳')
    const data = await tiktok(input.trim())

    if (!data.download || !data.download.length) {
      throw new Error('Media TikTok tidak ditemukan.')
    }

    /*
     * IMAGE SLIDE
     */
    if (!data.isVideo) {
      let sent = 0
      for (const image of data.download) {
        try {
          await conn.sendMessage(
            m.chat,
            {
              image: { url: image },
              caption: sent === 0
                ? `🖼️ *TikTok Image*\n\n👤 ${data.author.nickname || data.author.username || '-'}\n📝 ${data.title || '-'}`
                : ''
            },
            { quoted: m }
          )
          sent++
        } catch {}
      }

      if (!sent) throw new Error('Gagal mengirim image TikTok.')
      
      await m.react('✅')
      return
    }

    /*
     * VIDEO
     */
    const videoUrl = data.download[0]
    await conn.sendMessage(
      m.chat,
      {
        video: { url: videoUrl },
        caption: `🎬 *TikTok Downloader*\n\n` +
                 `👤 *Author:* ${data.author.nickname || data.author.username || '-'}\n` +
                 `📝 *Title:* ${data.title || '-'}\n` +
                 `❤️ *Like:* ${data.stats.like}\n` +
                 `👁️ *Views:* ${data.stats.views}\n` +
                 `💬 *Comment:* ${data.stats.comment}\n` +
                 `🔄 *Share:* ${data.stats.share}\n` +
                 `⏱️ *Duration:* ${data.duration}`,
        mimetype: 'video/mp4'
      },
      { quoted: m }
    )

    await m.react('✅')

  } catch (error) {
    console.error('[TIKTOK ERROR]', error)
    await m.react('❌').catch(() => {})
    return m.reply(`❌ *Gagal mengambil TikTok*\n\n${error?.message || error}`)
  }
}

handler.help = ['tiktok2 <url>', 'tt2 <url>']
handler.tags = ['downloader']
handler.command = ['tiktok2', 'tt2']
handler.limit = true

export default handler
export { tiktok }