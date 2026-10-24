
import axios from 'axios'

const HTTP_TIMEOUT_MS = 12_000
const MAX_QUERY_LENGTH = 240
const MAX_MESSAGE_LENGTH = 3_500
const SPOTIFY_TRACK_ID = /(?:open\.spotify\.com\/track\/|spotify:track:)([A-Za-z0-9]{10,64})/i

function cleanText(value, maxLength = MAX_QUERY_LENGTH) {
  return String(value || '')
    .replace(/\u0000/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function spotifyTrackId(value) {
  return cleanText(value, 1000).match(SPOTIFY_TRACK_ID)?.[1] || ''
}

function splitTitleAndArtist(value) {
  const title = cleanText(value)
  const match = title.match(/^(.+?)\s+-\s+(?:song and lyrics by\s+)?(.+)$/i)
  if (!match) return { trackName: title, artistName: '' }
  return {
    trackName: cleanText(match[1]),
    artistName: cleanText(match[2]),
  }
}

async function spotifyTrackMetadata(trackId) {
  if (!trackId) return { trackName: '', artistName: '' }

  const defaults = { trackName: '', artistName: '' }
  try {
    const { data } = await axios.get('https://open.spotify.com/oembed', {
      params: { url: `https://open.spotify.com/track/${trackId}` },
      timeout: HTTP_TIMEOUT_MS,
      headers: { 'user-agent': 'Mozilla/5.0' },
    })
    const parsed = splitTitleAndArtist(data?.title)
    defaults.trackName = parsed.trackName
    defaults.artistName = parsed.artistName
  } catch {
  }

  try {
    const { data: html } = await axios.get(`https://open.spotify.com/embed/track/${trackId}`, {
      timeout: HTTP_TIMEOUT_MS,
      responseType: 'text',
      headers: { 'user-agent': 'Mozilla/5.0' },
    })
    const artist = String(html || '').match(/"artists"\s*:\s*\[\s*\{\s*"name"\s*:\s*"([^"]+)"/i)?.[1]
    if (artist) defaults.artistName = cleanText(artist)
  } catch {
  }

  return defaults
}

function normalizeLyrics(data, fallback = {}) {
  const lyrics = String(data?.plainLyrics || data?.syncedLyrics || '').trim()
  if (!lyrics) return null
  return {
    trackName: cleanText(data?.trackName || fallback.trackName || 'Tidak diketahui'),
    artistName: cleanText(data?.artistName || fallback.artistName || 'Tidak diketahui'),
    albumName: cleanText(data?.albumName || '', 160),
    duration: Number(data?.duration) || 0,
    lyrics,
  }
}

async function findLyrics(query) {
  const rawQuery = cleanText(query)
  if (!rawQuery) throw new Error('Judul lagu atau tautan Spotify diperlukan.')

  const trackId = spotifyTrackId(rawQuery)
  const spotify = trackId ? await spotifyTrackMetadata(trackId) : { trackName: rawQuery, artistName: '' }
  const trackName = cleanText(spotify.trackName || rawQuery)
  const artistName = cleanText(spotify.artistName || '')
  const client = axios.create({
    baseURL: 'https://lrclib.net/api',
    timeout: HTTP_TIMEOUT_MS,
    headers: {
      'user-agent': 'Usanagi-Umi-AI/1.0 (Spotify Lyrics)',
      accept: 'application/json',
    },
  })

  try {
    const { data } = await client.get('/get', {
      params: { track_name: trackName, artist_name: artistName },
    })
    const result = normalizeLyrics(data, { trackName, artistName })
    if (result) return result
  } catch {
  }

  try {
    const { data } = await client.get('/search', {
      params: { q: [trackName, artistName].filter(Boolean).join(' ') },
    })
    if (Array.isArray(data)) {
      for (const item of data.slice(0, 5)) {
        const result = normalizeLyrics(item, { trackName, artistName })
        if (result) return result
      }
    }
  } catch {
  }

  throw new Error('Lirik lagu tidak ditemukan.')
}

function formatDuration(seconds) {
  const value = Math.max(0, Math.floor(Number(seconds) || 0))
  if (!value) return ''
  return `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`
}

function splitMessage(text, maxLength = MAX_MESSAGE_LENGTH) {
  const source = String(text || '').trim()
  if (source.length <= maxLength) return [source]

  const chunks = []
  let remaining = source
  while (remaining.length > maxLength) {
    let index = remaining.lastIndexOf('\n', maxLength)
    if (index < Math.floor(maxLength * 0.55)) index = remaining.lastIndexOf(' ', maxLength)
    if (index < Math.floor(maxLength * 0.55)) index = maxLength
    chunks.push(remaining.slice(0, index).trim())
    remaining = remaining.slice(index).trim()
  }
  if (remaining) chunks.push(remaining)
  return chunks.filter(Boolean)
}

async function react(conn, m, emoji) {
  try {
    if (typeof m?.react === 'function') return await m.react(emoji)
    const key = m?.raw?.key || m?.key
    if (key) return await conn.sendMessage(m.chat, { react: { text: emoji, key } })
  } catch {
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const query = cleanText(text)
  if (!query) {
    return m.reply([
      '╭─〔 SPOTIFY LYRICS 〕',
      '│',
      `│ ${usedPrefix}${command} <judul lagu / link Spotify>`,
      '│',
      `│ Contoh: ${usedPrefix}${command} NIKI lowkey`,
      `│ Contoh: ${usedPrefix}${command} https://open.spotify.com/track/xxxxx`,
      '╰────────────────',
    ].join('\n'))
  }

  await react(conn, m, '⏳')
  try {
    const result = await findLyrics(query)
    const details = [
      '🎵 *SPOTIFY LYRICS*',
      '',
      `*Judul:* ${result.trackName}`,
      `*Artis:* ${result.artistName}`,
      result.albumName ? `*Album:* ${result.albumName}` : '',
      result.duration ? `*Durasi:* ${formatDuration(result.duration)}` : '',
      '',
      '── LIRIK ──',
      result.lyrics,
    ].filter(Boolean).join('\n')

    const chunks = splitMessage(details)
    for (let index = 0; index < chunks.length; index += 1) {
      const suffix = chunks.length > 1 ? `\n\n_(${index + 1}/${chunks.length})_` : ''
      await conn.sendMessage(m.chat, { text: `${chunks[index]}${suffix}` }, { quoted: index === 0 ? m.raw : undefined })
    }
    await react(conn, m, '✅')
  } catch (error) {
    await react(conn, m, '❌')
    await m.reply(`Lirik Spotify gagal diambil.\n\n${String(error?.message || error)}`)
  }
}

handler.help = ['spotifylirik <judul/link Spotify>', 'spotifylyrics <judul/link Spotify>']
handler.tags = ['music']
handler.category = 'music'
handler.description = 'Mencari lirik dari judul atau link track Spotify'
handler.command = /^(spotifylirik|spotifylyrics)$/i
handler.limit = false

export default handler
