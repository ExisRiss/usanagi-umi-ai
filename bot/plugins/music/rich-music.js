/**
 * Rich Music Card - Interactive music player for WhatsApp
 * Mengirim kartu musik interaktif dengan info lagu, artwork, dan tombol play
 * 
 * Commands:
 *   .play <judul/url>    - Cari & kirim lagu dengan rich card
 *   .richplay <judul>    - Rich card version (alias)
 *   .song <judul>        - Search lagu
 * 
 */

import yts from 'yt-search'
import crypto from 'node:crypto'
import { proto, generateWAMessageFromContent, prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'

function shortId() {
  return crypto.randomBytes(8).toString('hex').toUpperCase()
}

function formatDuration(seconds) {
  if (!seconds) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatViews(n) {
  if (!n) return '0'
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B'
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M'
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K'
  return String(n)
}

async function searchYouTube(query) {
  const r = await yts(query)
  return (r.videos || []).slice(0, 6).map(v => ({
    id: v.videoId,
    title: v.title,
    author: v.author?.name || 'Unknown',
    duration: v.seconds,
    durationStr: v.timestamp || formatDuration(v.seconds),
    views: v.views,
    thumbnail: v.thumbnail,
    url: v.url
  }))
}

async function downloadAudio(url) {
  // Use savetube CDN (same as existing play.js)
  const { createDecipheriv } = await import('crypto')
  
  const METADATA_KEY = Buffer.from('C5D58EF67A7584E4A29F6C35BBC4EB12', 'hex')
  const HEADERS = {
    'Content-Type': 'application/json',
    Origin: 'https://yt.savetube.me',
    'User-Agent': 'Mozilla/5.0 (Linux; Android 15) AppleWebKit/537.36 Chrome/130 Mobile Safari/537.36'
  }

  const idMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([a-zA-Z0-9_-]{11})/)
  const videoId = idMatch ? idMatch[1] : null
  if (!videoId) throw new Error('URL YouTube tidak valid')

  const cdnRes = await fetch('https://media.savetube.vip/api/random-cdn', { headers: HEADERS }).then(v => v.json())
  if (!cdnRes?.cdn) throw new Error('CDN tidak tersedia')

  const info = await fetch(`https://${cdnRes.cdn}/v2/info`, {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({ url: `https://www.youtube.com/watch?v=${videoId}` })
  }).then(v => v.json())

  if (!info?.data) throw new Error('Metadata kosong')

  const encrypted = Buffer.from(info.data, 'base64')
  const decipher = createDecipheriv('aes-128-cbc', METADATA_KEY, encrypted.subarray(0, 16))
  const decrypted = Buffer.concat([decipher.update(encrypted.subarray(16)), decipher.final()])
  const metadata = JSON.parse(decrypted.toString('utf8'))

  const dl = await fetch(`https://${cdnRes.cdn}/download`, {
    method: 'POST', headers: HEADERS,
    body: JSON.stringify({ id: videoId, downloadType: 'audio', quality: '128kbps', key: metadata.key })
  }).then(v => v.json())

  if (!dl?.data?.downloadUrl) throw new Error(dl?.message || 'Download gagal')
  return { url: dl.data.downloadUrl, videoId }
}

const handler = async (m, { conn, text, command, usedPrefix }) => {
  if (!text) return m.reply(`🎵 *Rich Music Player*\n\nKetik: *${usedPrefix}play <judul lagu atau URL YouTube>*\n\nContoh:\n${usedPrefix}play Dj Aisyah Istri Muhammad\n${usedPrefix}play https://youtu.be/xxx`)

  const cmd = command.toLowerCase()
  const isUrl = /youtu(\.be|be\.com)/i.test(text)

  // Search
  await m.reply('🔍 Mencari lagu...')
  
  let results
  try {
    if (isUrl) {
      results = [{ url: text, title: 'YouTube Audio', author: '', duration: 0, durationStr: '', views: 0, thumbnail: '', id: '' }]
    } else {
      results = await searchYouTube(text)
      if (!results.length) return m.reply('❌ Lagu tidak ditemukan.')
    }
  } catch (e) {
    return m.reply(`❌ Error pencarian: ${e.message}`)
  }

  const song = results[0]

  // If multiple results and not URL, show carousel
  if (results.length > 1 && !isUrl) {
    try {
      await sendMusicCarousel(conn, m, results, usedPrefix)
    } catch (e) {
      console.error('[MUSIC CAROUSEL]', e)
      // Fallback: just play first result
      await playAndSend(conn, m, song)
    }
    return
  }

  // Single result or URL - play directly
  await playAndSend(conn, m, song)
}

async function sendMusicCarousel(conn, m, results, usedPrefix) {
  const cards = []

  for (const song of results.slice(0, 5)) {
    let imageMessage = null
    if (song.thumbnail) {
      try {
        const media = await prepareWAMessageMedia(
          { image: { url: song.thumbnail } },
          { upload: conn.waUploadToServer }
        )
        imageMessage = media.imageMessage
      } catch {}
    }

    cards.push({
      body: proto.Message.InteractiveMessage.Body.fromObject({
        text: `🎵 ${song.title}\n👤 ${song.author}\n⏱️ ${song.durationStr} • 👁️ ${formatViews(song.views)}`
      }),
      footer: proto.Message.InteractiveMessage.Footer.fromObject({
        text: 'Tap tombol untuk play'
      }),
      header: proto.Message.InteractiveMessage.Header.fromObject({
        title: song.title.substring(0, 60),
        hasMediaAttachment: !!imageMessage,
        imageMessage
      }),
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
        buttons: [{
          name: 'single_select',
          buttonParamsJson: JSON.stringify({
            title: '▶️ Play Lagu Ini',
            sections: [{
              title: 'Play',
              rows: [{
                header: song.title.substring(0, 40),
                title: `${song.author} • ${song.durationStr}`,
                description: `Play: ${song.url}`,
                id: `${usedPrefix}play ${song.url}`
              }]
            }]
          })
        }]
      })
    })
  }

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        messageContextInfo: {
          deviceListMetadata: {},
          deviceListMetadataVersion: 2
        },
        interactiveMessage: proto.Message.InteractiveMessage.fromObject({
          body: proto.Message.InteractiveMessage.Body.create({
            text: `🎵 *Hasil Pencarian: "${m.text?.slice(0, 40) || ''}"*\n\nPilih lagu dari daftar di bawah:`
          }),
          footer: proto.Message.InteractiveMessage.Footer.create({
            text: '🎵 Usanagi Music'
          }),
          header: proto.Message.InteractiveMessage.Header.create({
            hasMediaAttachment: false
          }),
          carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
            cards
          })
        })
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

async function playAndSend(conn, m, song) {
  await m.reply('⬇️ Mengunduh audio...')

  try {
    const { url: audioUrl, videoId } = await downloadAudio(song.url)
    
    // Download audio buffer
    const audioRes = await fetch(audioUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 15) Chrome/130' }
    })
    if (!audioRes.ok) throw new Error(`Download HTTP ${audioRes.status}`)
    
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer())
    if (audioBuffer.length < 1000) throw new Error('Audio terlalu kecil/gagal')

    // Get thumbnail for rich card
    const thumbUrl = song.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
    
    // Send as rich card with audio
    const caption = `╔══ *🎵 NOW PLAYING* ══╗\n\n` +
      `🎶 ${song.title}\n` +
      `👤 ${song.author || 'Unknown'}\n` +
      `⏱️ ${song.durationStr || 'N/A'}\n` +
      `👁️ ${formatViews(song.views)} views\n\n` +
      `╚══ By AlzRiss - Usanagi Umi AI ══╝`

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      ptt: false,
      fileName: `${song.title?.substring(0, 40) || 'audio'}.mp3`,
      contextInfo: {
        externalAdReply: {
          title: song.title?.substring(0, 60) || 'Music',
          body: `${song.author || ''} • ${song.durationStr || ''}`.substring(0, 60),
          mediaType: 2,
          thumbnailUrl: thumbUrl,
          sourceUrl: song.url,
          renderLargerThumbnail: true,
          showAdAttribution: false
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error('[RICH MUSIC]', e)
    return m.reply(`❌ Gagal download audio: ${e.message}\nCoba gunakan command .play2 atau .ytmp3`)
  }
}

handler.help = ['play <judul/url>', 'richplay <judul>', 'song <judul>']
handler.tags = ['music']
handler.command = /^(play|richplay|song)$/i
handler.limit = true

export default handler