// plugins/downloader/down-spdl.js
//
// Spotify downloader — Umi Usanagi AI.
//
// Riwayat: versi lama memakai API SpotSaver (spotsaver.net) yang sudah mati —
// servernya sekarang membalas 308 -> halaman 404 HTML, sehingga res.json() melempar
// "Unexpected token '<', "<!DOCTYPE "... is not valid JSON" (laporan Feedback
// 15 Okt 2026). Scraper cadangan spotidown.app juga sudah tidak berfungsi.
//
// Implementasi sekarang tidak bergantung pada scraper Spotify pihak ketiga:
//   1. Metadata diambil dari endpoint RESMI Spotify (oEmbed + halaman embed),
//      yang stabil dan tidak butuh kunci API.
//   2. Audio dicari dari YouTube memakai pipeline SaveTube yang sudah dipakai
//      fitur .play/.ytplay (lib/scrape/YouTube.js), lalu dikirim sebagai mp3.
// Caption menyebut sumber audio apa adanya supaya pengguna tidak tertipu.

import { searchYoutube, getYoutubeDirectUrl } from '../../lib/scrape/YouTube.js'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
const FETCH_TIMEOUT = 20000

/** Ambil JSON dengan aman: HTML (halaman error) tidak lagi meledak sebagai SyntaxError mentah. */
async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'User-Agent': UA, Accept: 'application/json', ...(options.headers || {}) },
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  })
  const raw = await res.text()
  if (/^\s*</.test(raw)) {
    throw new Error(`Layanan sumber membalas halaman HTML (HTTP ${res.status}), bukan data. Kemungkinan sedang tidak tersedia.`)
  }
  let data
  try {
    data = JSON.parse(raw)
  } catch {
    throw new Error(`Layanan sumber membalas data yang tidak dapat dibaca (HTTP ${res.status}).`)
  }
  if (!res.ok) throw new Error(data?.error?.message || data?.message || `Permintaan gagal: HTTP ${res.status}`)
  return data
}

/** Jenis & ID dari URL Spotify, mis. track/0JOY... -> { type: 'track', id: '0JOY...' } */
function parseSpotifyUrl(input) {
  const match = String(input || '').match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(track|album|playlist|artist|episode|show)\/([A-Za-z0-9]+)/i)
  if (!match) return null
  return { type: match[1].toLowerCase(), id: match[2] }
}

/** Metadata resmi dari oEmbed Spotify (judul, sampul). */
async function spotifyOembed(url) {
  const data = await fetchJson(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
  return {
    title: String(data?.title || '').trim(),
    cover: String(data?.thumbnail_url || '').trim(),
  }
}

/** Nama artis dari halaman embed (oEmbed tidak menyediakannya untuk track). */
async function spotifyArtists(type, id) {
  try {
    const res = await fetch(`https://open.spotify.com/embed/${type}/${id}?utm_source=generator`, {
      headers: { 'User-Agent': UA },
      signal: AbortSignal.timeout(FETCH_TIMEOUT),
    })
    const html = await res.text()
    const block = html.match(/"artists":\[(.*?)\]/s)?.[1] || ''
    const names = [...block.matchAll(/"name":"((?:[^"\\]|\\.)*)"/g)].map(m => {
      try { return JSON.parse(`"${m[1]}"`) } catch { return m[1] }
    })
    return [...new Set(names.filter(Boolean))]
  } catch {
    return []
  }
}

/** Cari audio di YouTube lalu kembalikan URL unduhan mp3-nya. */
async function youtubeAudioUrl(query) {
  const youtubeUrl = await searchYoutube(query)
  const info = await getYoutubeDirectUrl(youtubeUrl, 'mp3')
  if (!info?.url) throw new Error('Link audio tidak ditemukan untuk lagu ini.')
  return info.url
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    throw `*Contoh:*\n${usedPrefix + command} https://open.spotify.com/track/... \n${usedPrefix + command} nama lagu artis`
  }

  const parsed = parseSpotifyUrl(text)

  // ── Pencarian teks bebas: langsung cari audionya ─────────────────────
  if (!parsed) {
    await m.react?.('⏳').catch(() => {})
    const audioUrl = await youtubeAudioUrl(text)
    await conn.sendFile(m.chat, audioUrl, 'audio.mp3', `🎵 *Hasil pencarian:* ${text}\n_Sumber audio: YouTube (Umi Usanagi AI)_`, m, null, { mimetype: 'audio/mpeg' })
    await m.react?.('✅').catch(() => {})
    return
  }

  // ── Playlist/album/artis: beri ringkasan resmi + arahan ──────────────
  if (parsed.type !== 'track' && parsed.type !== 'episode') {
    const meta = await spotifyOembed(text)
    const label = { playlist: 'Playlist', album: 'Album', artist: 'Artis', show: 'Podcast' }[parsed.type] || 'Spotify'
    const caption = [
      `🎵 *${label} Spotify*`,
      meta.title ? `*Judul:* ${meta.title}` : '',
      '',
      'Unduhan massal per playlist/album belum didukung. Kirim tautan *track* satu per satu, contoh:',
      `${usedPrefix + command} https://open.spotify.com/track/...`,
    ].filter(Boolean).join('\n')
    if (meta.cover) await conn.sendFile(m.chat, meta.cover, 'cover.jpg', caption, m)
    else m.reply(caption)
    return
  }

  // ── Track/episode: metadata Spotify + audio YouTube ──────────────────
  await m.react?.('⏳').catch(() => {})
  const [meta, artists] = await Promise.all([
    spotifyOembed(text),
    spotifyArtists(parsed.type, parsed.id),
  ])
  if (!meta.title) throw 'Metadata lagu tidak ditemukan. Pastikan tautan Spotify masih aktif.'

  const artistText = artists.join(', ')
  const audioUrl = await youtubeAudioUrl(`${meta.title} ${artistText}`.trim())

  const caption = [
    `🎵 *${meta.title}*`,
    artistText ? `👤 *Artis:* ${artistText}` : '',
    `🔗 ${text.split('?')[0]}`,
    '',
    '_Audio dicocokkan dari YouTube berdasarkan metadata Spotify — Umi Usanagi AI_',
  ].filter(Boolean).join('\n')

  if (meta.cover) await conn.sendFile(m.chat, meta.cover, 'cover.jpg', caption, m)
  else m.reply(caption)
  await conn.sendFile(m.chat, audioUrl, 'audio.mp3', '', m, null, { mimetype: 'audio/mpeg' })
  await m.react?.('✅').catch(() => {})
}

handler.help = ['spotify <url|judul>']
handler.tags = ['downloader']
handler.command = /^(spotify|spotdl|spdl)$/i

export default handler
