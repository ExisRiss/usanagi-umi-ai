
import axios from 'axios'
import crypto from 'node:crypto'
import { sendInteractive } from '../../lib/awang-tombol.js'

const SECRET = 'YOUR_API_KEY'
const SPOTIFY_VERSION = 61
const SPOTIFY_CLIENT_VERSION = '1.2.88.61.ge172202b'
const RESULT_LIMIT = 10
const SELECTION_TTL = 10 * 60 * 1000
const selectionCache = globalThis.__usanagiSpotifySearchSelections || new Map()
globalThis.__usanagiSpotifySearchSelections = selectionCache

const cleanText = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback
  const text = String(value).replace(/\s+/g, ' ').trim()
  return text || fallback
}

const shorten = (value, max = 72) => {
  const text = cleanText(value)
  if (!text) return ''
  const chars = Array.from(text)
  if (chars.length <= max) return text
  const cut = chars.slice(0, Math.max(1, max - 1)).join('')
  const wordSafe = cut.replace(/\s+\S*$/, '').trim()
  return `${wordSafe || cut.trim()}…`
}

const firstNumber = (...values) => {
  for (const value of values) {
    const number = Number(value)
    if (Number.isFinite(number)) return number
  }
  return null
}

const formatCount = value => {
  const number = firstNumber(value)
  if (number === null) return '-'
  return new Intl.NumberFormat('id-ID', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(number)
}

const msToTime = (ms = 0) => {
  const total = Math.max(0, Math.floor(Number(ms) || 0) / 1000)
  const minutes = Math.floor(total / 60)
  const seconds = Math.floor(total % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

const react = async (conn, m, emoji) => {
  try {
    if (!m?.raw?.key) return
    await conn.sendMessage(m.chat, { react: { text: emoji, key: m.raw.key } })
  } catch {}
}

const buildSpotifyUrl = id => id ? `https://open.spotify.com/track/${id}` : ''
const buildEmbedUrl = id => id ? `https://open.spotify.com/embed/track/${id}` : ''

const getBestImage = sources => {
  if (!Array.isArray(sources)) return null
  return sources.find(value => typeof value?.url === 'string' && value.url) ? sources.find(value => typeof value?.url === 'string' && value.url).url : null
}

const collectArtists = value => {
  if (!Array.isArray(value)) return []
  return value.map(item => cleanText(
    item?.profile?.name ||
    item?.name ||
    item?.artist?.name
  )).filter(Boolean)
}

const normalizeTrack = data => {
  if (!data) return null
  const rawId = cleanText(data?.id || data?.uri?.split(':')?.[2])
  if (!rawId) return null
  const artists = collectArtists(data?.artists?.items || data?.artists)
  const image = getBestImage(
    data?.albumOfTrack?.coverArt?.sources ||
    data?.album?.images ||
    data?.album?.coverArt?.sources
  )
  return {
    id: rawId,
    url: buildSpotifyUrl(rawId),
    embedUrl: buildEmbedUrl(rawId),
    title: cleanText(data?.name || data?.title, 'Tanpa judul'),
    artists,
    album: cleanText(data?.albumOfTrack?.name || data?.album?.name || data?.album, '-'),
    duration: firstNumber(
      data?.duration?.totalMilliseconds,
      data?.duration_ms,
      data?.duration
    ) || 0,
    image,
    explicit: data?.contentRating?.label === 'EXPLICIT' || Boolean(data?.explicit),
    popularity: firstNumber(data?.popularity),
    playcount: firstNumber(data?.playcount)
  }
}

const parseSearch = payload => {
  const root = payload?.data?.searchV2 || payload?.searchV2 || payload || {}
  const primary = Array.isArray(root?.tracksV2?.items)
    ? root.tracksV2.items
    : Array.isArray(root?.topResultsV2?.itemsV2)
      ? root.topResultsV2.itemsV2
      : []

  const seen = new Set()
  return primary
    .map(item => normalizeTrack(item?.item?.data || item?.data || item))
    .filter(item => item && !seen.has(item.id) && seen.add(item.id))
    .slice(0, RESULT_LIMIT)
}

const parseRestSearch = payload => {
  const items = Array.isArray(payload?.tracks?.items) ? payload.tracks.items : []
  const seen = new Set()
  return items
    .map(normalizeTrack)
    .filter(item => item && !seen.has(item.id) && seen.add(item.id))
    .slice(0, RESULT_LIMIT)
}

const parseSpotifyUrl = value => {
  const match = String(value || '').match(/(?:open\.spotify\.com\/track\/|spotify:track:)([A-Za-z0-9]{10,64})/i)
  return match?.[1] || null
}

class SpotifyWebPlayer {
  constructor() {
    this.api = axios.create({
      timeout: 25000,
      headers: {
        referer: 'https://open.spotify.com/',
        origin: 'https://open.spotify.com',
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36'
      }
    })
    this.expiresAt = 0
  }

  generateTOTP(tsms = Date.now()) {
    const counter = Math.floor((tsms / 1000) / 30)
    const buffer = Buffer.alloc(8)
    buffer.writeBigInt64BE(BigInt(counter))
    const digest = crypto.createHmac('sha1', Buffer.from(SECRET, 'utf8')).update(buffer).digest()
    const offset = digest[digest.length - 1] & 0xf
    const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1000000
    return String(code).padStart(6, '0')
  }

  clearToken() {
    delete this.api.defaults.headers.authorization
    delete this.api.defaults.headers['client-token']
    delete this.api.defaults.headers['spotify-app-version']
    delete this.api.defaults.headers['app-platform']
    delete this.api.defaults.headers['accept-language']
    this.expiresAt = 0
  }

  async getToken(force = false) {
    if (!force && this.api.defaults.headers.authorization && Date.now() < this.expiresAt) {
      return this.api.defaults.headers.authorization.replace(/^Bearer\s+/i, '')
    }

    const now = Math.floor(Date.now() / 1000)
    let token = null
    let firstError = null

    try {
      const response = await this.api.get('https://open.spotify.com/api/token', {
        params: {
          reason: 'init',
          productType: 'web-player',
          totp: this.generateTOTP(Date.now()),
          totpServer: this.generateTOTP(now * 1000),
          totpVer: String(SPOTIFY_VERSION)
        }
      })
      token = response?.data
    } catch (error) {
      firstError = error
    }

    if (!token?.accessToken) {
      try {
        const response = await this.api.get('https://open.spotify.com/get_access_token', {
          params: { reason: 'transport', productType: 'web_player' }
        })
        token = response?.data
      } catch (error) {
        throw firstError || error
      }
    }

    if (!token?.accessToken) throw new Error('Spotify access token tidak tersedia')

    let clientToken = null
    if (token?.clientId) {
      try {
        const { data: client } = await this.api.post('https://clienttoken.spotify.com/v1/clienttoken', {
          client_data: {
            client_version: SPOTIFY_CLIENT_VERSION,
            client_id: token.clientId,
            js_sdk_data: {
              device_brand: 'unknown',
              device_model: 'unknown',
              os: 'linux',
              os_version: '24.04',
              device_id: crypto.randomUUID(),
              device_type: 'computer'
            }
          }
        })
        clientToken = client?.granted_token?.token || null
      } catch {}
    }

    Object.assign(this.api.defaults.headers, {
      'accept-language': 'en',
      'app-platform': 'WebPlayer',
      authorization: `Bearer ${token.accessToken}`,
      'spotify-app-version': SPOTIFY_CLIENT_VERSION
    })
    if (clientToken) this.api.defaults.headers['client-token'] = clientToken
    this.expiresAt = Number(token?.accessTokenExpirationTimestampMs) > Date.now()
      ? Number(token.accessTokenExpirationTimestampMs) - 60000
      : Date.now() + 10 * 60 * 1000
    return token.accessToken
  }

  async query(operationName, sha256Hash, variables) {
    await this.getToken()
    try {
      const { data } = await this.api.post('https://api-partner.spotify.com/pathfinder/v2/query', {
        variables,
        operationName,
        extensions: { persistedQuery: { version: 1, sha256Hash } }
      })
      return data
    } catch (error) {
      if (Number(error?.response?.status) === 401) {
        this.clearToken()
        await this.getToken(true)
        const { data } = await this.api.post('https://api-partner.spotify.com/pathfinder/v2/query', {
          variables,
          operationName,
          extensions: { persistedQuery: { version: 1, sha256Hash } }
        })
        return data
      }
      const params = new URLSearchParams({
        operationName,
        variables: JSON.stringify(variables),
        extensions: JSON.stringify({ persistedQuery: { version: 1, sha256Hash } })
      })
      const { data } = await this.api.get(`https://api-partner.spotify.com/pathfinder/v1/query?${params.toString()}`, { timeout: 12000 })
      return data
    }
  }

  async search(query) {
    return this.query(
      'searchDesktop',
      '21b3fe49546912ba782db5c47e9ef5a7dbd20329520ba0c7d0fcfadee671d24e',
      {
        searchTerm: query,
        offset: 0,
        limit: RESULT_LIMIT,
        numberOfTopResults: 5,
        includeAudiobooks: true,
        includeArtistHasConcertsField: false,
        includePreReleases: true,
        includeAuthors: false,
        includeEpisodeContentRatingsV2: false
      }
    )
  }

  async track(id) {
    return this.query(
      'getTrack',
      '612585ae06ba435ad26369870deaae23b5c8800a256cd8a57e08eddc25a37294',
      { uri: `spotify:track:${id}` }
    )
  }
}

const spotify = new SpotifyWebPlayer()

const officialRestSearch = async query => {
  const clientId = cleanText(process.env.SPOTIFY_CLIENT_ID)
  const clientSecret = cleanText(process.env.SPOTIFY_CLIENT_SECRET)
  if (!clientId || !clientSecret) return []

  const basic = Buffer.from(`${clientId}:${clientSecret}`, 'utf8').toString('base64')
  const tokenResponse = await axios.post(
    'https://accounts.spotify.com/api/token',
    new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
    {
      timeout: 15000,
      headers: {
        Authorization: `Basic ${basic}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  )

  const token = cleanText(tokenResponse?.data?.access_token)
  if (!token) return []

  const { data } = await axios.get('https://api.spotify.com/v1/search', {
    timeout: 15000,
    headers: { Authorization: `Bearer ${token}` },
    params: { q: query, type: 'track', limit: RESULT_LIMIT }
  })
  return parseRestSearch(data)
}

const putSelection = (chat, item) => {
  const payload = {
    id: item.id,
    u: item.url,
    t: shorten(item.title, 120),
    a: shorten(item.artists.join(', ') || 'Spotify', 90),
    al: shorten(item.album, 80),
    d: item.duration,
    i: item.image || '',
    p: item.playcount,
    r: item.popularity,
    x: Boolean(item.explicit)
  }
  const token = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  selectionCache.set(`${chat}:${token}`, { item, createdAt: Date.now() })
  return token
}

const getSelection = (chat, token) => {
  const entry = selectionCache.get(`${chat}:${token}`)
  if (!entry) return null
  if (Date.now() - entry.createdAt > SELECTION_TTL) {
    selectionCache.delete(`${chat}:${token}`)
    return null
  }
  return entry.item
}

const decodeSelection = token => {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'))
    if (!payload?.id) return null
    return {
      id: cleanText(payload.id),
      url: cleanText(payload.u || buildSpotifyUrl(payload.id)),
      embedUrl: buildEmbedUrl(cleanText(payload.id)),
      title: cleanText(payload.t, 'Tanpa judul'),
      artists: cleanText(payload.a, 'Spotify').split(',').map(value => cleanText(value)).filter(Boolean),
      album: cleanText(payload.al, '-'),
      duration: firstNumber(payload.d) || 0,
      image: cleanText(payload.i),
      playcount: firstNumber(payload.p),
      popularity: firstNumber(payload.r),
      explicit: Boolean(payload.x)
    }
  } catch {
    return null
  }
}

const pruneCache = () => {
  const now = Date.now()
  for (const [key, entry] of selectionCache) {
    if (now - entry.createdAt > SELECTION_TTL) selectionCache.delete(key)
  }
  while (selectionCache.size > 600) selectionCache.delete(selectionCache.keys().next().value)
}

const buildRows = (list, usedPrefix) => list.map((item, index) => {
  const token = putSelection('', item)
  return {
    title: `${index + 1}. ${shorten(item.title, 38)}`,
    description: shorten(`${shorten(item.artists.join(', ') || 'Spotify', 28)} • ${shorten(item.album, 26)}`, 56),
    command: `${usedPrefix}spotifysearch __pick ${token}`
  }
})

const setSelectionChat = (rows, chat) => {
  for (const row of rows) {
    const match = row.command.match(/__pick\s+(.+)$/)
    if (!match) continue
    const token = match[1]
    const pending = selectionCache.get(`:${token}`)
    if (pending) {
      selectionCache.delete(`:${token}`)
      selectionCache.set(`${chat}:${token}`, pending)
    }
  }
}

const renderTrack = async (m, conn, item, refreshed = null) => {
  const selected = refreshed || item
  const title = shorten(selected?.title || item?.title, 90)
  const artists = shorten((selected?.artists || item?.artists || []).join(', ') || 'Spotify', 70)
  const album = shorten(selected?.album || item?.album, 60)
  const duration = selected?.duration || item?.duration || 0
  const popularity = selected?.popularity ?? item?.popularity
  const playcount = selected?.playcount ?? item?.playcount
  const explicit = Boolean(selected?.explicit ?? item?.explicit)
  const spotifyUrl = selected?.url || item?.url
  const embedUrl = selected?.embedUrl || buildEmbedUrl(selected?.id || item?.id)

  const lines = [
    `Judul    : ${title}`,
    `Artist   : ${artists}`,
    `Album    : ${album}`,
    `Durasi   : ${msToTime(duration)}`,
    popularity !== null && popularity !== undefined ? `Popular  : ${formatCount(popularity)}` : '',
    playcount !== null && playcount !== undefined ? `Playcount: ${formatCount(playcount)}` : '',
    `Explicit : ${explicit ? 'Ya' : 'Tidak'}`
  ].filter(Boolean)

  const buttons = []
  if (spotifyUrl) {
    buttons.push({ type: 'url', label: 'Buka Spotify', url: spotifyUrl })
  }
  if (embedUrl) {
    buttons.push({ type: 'url', label: 'Web Player', url: embedUrl })
  }

  return sendInteractive(conn, m.chat, {
    title: 'Spotify Track',
    body: `${lines.join('\n')}\n\nPilih salah satu untuk melanjutkan pemutaran.`,
    footer: 'Usanagi Umi AI • Spotify Search',
    buttons,
    fallbackToText: true
  }, { quoted: m.raw })
}

const handler = async (m, { conn, usedPrefix }) => {
  pruneCache()
  const args = Array.isArray(m?.args) ? m.args : []
  const subcommand = cleanText(args[0]).toLowerCase()

  if (subcommand === '__pick') {
    const token = cleanText(args.slice(1).join(' '))
    const cached = getSelection(m.chat, token)
    const decoded = decodeSelection(token)
    const item = cached || decoded

    if (!item?.id) {
      await react(conn, m, '❌')
      return m.reply('Hasil Spotify sudah kedaluwarsa. Silakan lakukan pencarian ulang.')
    }

    await react(conn, m, '⏳')
    try {
      let refreshed = null
      try {
        const detail = await spotify.track(item.id)
        refreshed = normalizeTrack(detail?.data?.trackUnion || detail?.trackUnion || detail)
      } catch {}
      await renderTrack(m, conn, item, refreshed || item)
      await react(conn, m, '✅')
    } catch {
      await react(conn, m, '❌')
      return m.reply('Detail Spotify tidak dapat ditampilkan. Silakan pilih hasil lain.')
    }
    return
  }

  const query = cleanText(m?.text)
  if (!query) {
    return m.reply(`Gunakan ${usedPrefix}spotifysearch\nContoh: ${usedPrefix}spotifysearch NIKI lowkey`)
  }

  await react(conn, m, '⏳')

  try {
    const raw = await spotify.search(query)
    let list = parseSearch(raw)

    if (!list.length) {
      list = await officialRestSearch(query).catch(() => [])
    }

    if (!list.length) {
      await react(conn, m, '❌')
      return m.reply(`Tidak ada hasil Spotify untuk “${shorten(query, 80)}”.`)
    }

    const rows = buildRows(list, usedPrefix)
    setSelectionChat(rows, m.chat)

    await sendInteractive(conn, m.chat, {
      title: 'Spotify Search',
      body: `Query: ${shorten(query, 70)}\nHasil: ${list.length}\n\nPilih lagu untuk melihat detail dan membuka Spotify.`,
      footer: 'Usanagi Umi AI • Spotify Search',
      list: {
        listTitle: 'Pilih Lagu',
        sections: [{ title: 'Hasil Pencarian', rows }]
      },
      fallbackToText: true
    }, { quoted: m.raw })

    await react(conn, m, '✅')
  } catch {
    await react(conn, m, '❌')
    return m.reply('Pencarian Spotify sedang tidak tersedia. Silakan coba lagi beberapa saat lagi.')
  }
}

handler.help = ['spotifysearch']
handler.tags = ['search']
handler.command = /^spotifysearch$/i
handler.limit = true

export default handler
