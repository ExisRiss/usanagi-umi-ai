/**
 * Spotify Search
 * Type: Plugin ESM
 */

import axios from 'axios'
import crypto from 'crypto'

class Spotify {
  constructor() {
    this.secret = 'YOUR_API_KEY'
    this.version = 61
    this.client_version = '1.2.88.61.ge172202b'

    this.api = axios.create({
      timeout: 30000,
      headers: {
        referer: 'https://open.spotify.com/',
        origin: 'https://open.spotify.com',
        accept: 'application/json',
        'content-type': 'application/json',
        'user-agent': 'Mozilla/5.0'
      }
    })
  }

  generateTOTP(tsms = Date.now()) {
    const counter = Math.floor((tsms / 1000) / 30)
    const buffer = Buffer.alloc(8)
    buffer.writeBigInt64BE(BigInt(counter))

    const digest = crypto
      .createHmac('sha1', Buffer.from(this.secret, 'utf8'))
      .update(buffer)
      .digest()

    const offset = digest[digest.length - 1] & 0xf
    const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 1000000

    return String(code).padStart(6, '0')
  }

  async getToken() {
    if (this.api.defaults.headers.authorization) return true

    const sts = Math.floor(Date.now() / 1000)

    const { data: token } = await this.api.get('https://open.spotify.com/api/token', {
      params: {
        reason: 'init',
        productType: 'web-player',
        totp: this.generateTOTP(Date.now()),
        totpServer: this.generateTOTP(sts * 1000),
        totpVer: String(this.version)
      }
    })

    const { data: client } = await this.api.post('https://clienttoken.spotify.com/v1/clienttoken', {
      client_data: {
        client_version: this.client_version,
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

    Object.assign(this.api.defaults.headers, {
      'accept-language': 'en',
      'app-platform': 'WebPlayer',
      authorization: `Bearer ${token.accessToken}`,
      'client-token': client.granted_token.token,
      'spotify-app-version': this.client_version
    })

    return true
  }

  async query(operationName, sha256Hash, variables) {
    await this.getToken()

    const { data } = await this.api.post('https://api-partner.spotify.com/pathfinder/v2/query', {
      variables,
      operationName,
      extensions: {
        persistedQuery: {
          version: 1,
          sha256Hash
        }
      }
    })

    return data
  }

  async search(q) {
    const data = await this.query(
      'searchDesktop',
      '21b3fe49546912ba782db5c47e9ef5a7dbd20329520ba0c7d0fcfadee671d24e',
      {
        searchTerm: q,
        offset: 0,
        limit: 10,
        numberOfTopResults: 5,
        includeAudiobooks: true,
        includeArtistHasConcertsField: false,
        includePreReleases: true,
        includeAuthors: false,
        includeEpisodeContentRatingsV2: false
      }
    )

    return data?.data?.searchV2
  }

  async track(id) {
    const data = await this.query(
      'getTrack',
      '612585ae06ba435ad26369870deaae23b5c8800a256cd8a57e08eddc25a37294',
      { uri: `spotify:track:${id}` }
    )

    return data?.data?.trackUnion
  }
}

const spotify = new Spotify()

function spotifyUrl(text = '') {
  const match = String(text).match(/open\.spotify\.com\/(track)\/([a-zA-Z0-9]+)/i)
  if (!match) return null
  return {
    type: match[1],
    id: match[2]
  }
}

function msToTime(ms = 0) {
  const sec = Math.floor(ms / 1000)
  const min = Math.floor(sec / 60)
  const s = sec % 60
  return `${min}:${String(s).padStart(2, '0')}`
}

function getImages(o) {
  return o?.sources || []
}

function getBestImage(images = []) {
  return images?.[0]?.url || images?.[images.length - 1]?.url || null
}

function parseTrack(t) {
  if (!t) return null

  return {
    id: t.uri?.split(':')?.[2],
    url: t.uri ? `https://open.spotify.com/track/${t.uri.split(':')[2]}` : null,
    title: t.name || '-',
    duration: t.duration?.totalMilliseconds || 0,
    playcount: Number(t.playcount || 0),
    explicit: t.contentRating?.label === 'EXPLICIT',
    artists: [
      ...(t.firstArtist?.items || []),
      ...(t.otherArtists?.items || []),
      ...(t.artists?.items || [])
    ].map(v => v.profile?.name).filter(Boolean),
    album: {
      name: t.albumOfTrack?.name || '-',
      year: t.albumOfTrack?.date?.year || '-',
      image: getBestImage(getImages(t.albumOfTrack?.coverArt))
    }
  }
}

function parseSearch(data) {
  const tracks =
    data?.tracksV2?.items ||
    data?.topResultsV2?.itemsV2?.filter(v => v.item?.__typename === 'TrackResponseWrapper') ||
    []

  return tracks.map(node => {
    const t = node.item?.data || node.data
    if (!t) return null

    return {
      id: t.uri?.split(':')?.[2],
      url: t.uri ? `https://open.spotify.com/track/${t.uri.split(':')[2]}` : null,
      title: t.name || '-',
      duration: t.duration?.totalMilliseconds || 0,
      explicit: t.contentRating?.label === 'EXPLICIT',
      artists: (t.artists?.items || []).map(v => v.profile?.name).filter(Boolean),
      album: {
        name: t.albumOfTrack?.name || '-',
        image: getBestImage(getImages(t.albumOfTrack?.coverArt))
      }
    }
  }).filter(Boolean)
}

function formatTrack(t) {
  return `🎧 *SPOTIFY TRACK*

*Judul:* ${t.title}
*Artist:* ${t.artists.join(', ') || '-'}
*Album:* ${t.album.name}
*Rilis:* ${t.album.year}
*Durasi:* ${msToTime(t.duration)}
*Playcount:* ${t.playcount.toLocaleString('id-ID')}
*Explicit:* ${t.explicit ? 'Ya' : 'Tidak'}

${t.url}`
}

function formatSearch(list, query) {
  return `🎧 *SPOTIFY SEARCH*

Query: *${query}*

${list.slice(0, 10).map((v, i) => {
  return `${i + 1}. *${v.title}*
   👤 ${v.artists.join(', ') || '-'}
   💿 ${v.album.name}
   ⏱️ ${msToTime(v.duration)}
   🔗 ${v.url}`
}).join('\n\n')}`
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `🎧 *SPOTIFY SEARCH*\n\n` +
      `Contoh:\n` +
      `${usedPrefix + command} NIKI lowkey\n` +
      `${usedPrefix + command} https://open.spotify.com/track/xxxx`
    )
  }

  try {
    await m.react?.('🕒')

    const parsed = spotifyUrl(text)

    if (parsed?.type === 'track') {
      const raw = await spotify.track(parsed.id)
      const data = parseTrack(raw)

      if (!data) throw new Error('Track tidak ditemukan')

      const caption = formatTrack(data)

      if (data.album.image) {
        await conn.sendMessage(m.chat, {
          image: { url: data.album.image },
          caption
        }, { quoted: m })
      } else {
        await m.reply(caption)
      }

      await m.react?.('✅')
      return
    }

    const raw = await spotify.search(text)
    const list = parseSearch(raw)

    if (!list.length) throw new Error('Lagu tidak ditemukan')

    const caption = formatSearch(list, text)
    const thumb = list[0]?.album?.image

    if (thumb) {
      await conn.sendMessage(m.chat, {
        image: { url: thumb },
        caption
      }, { quoted: m })
    } else {
      await m.reply(caption)
    }

    await m.react?.('✅')
  } catch (e) {
    await m.react?.('❌')
    await m.reply(`Gagal mengambil data Spotify.\n\n${e.message}`)
  }
}

handler.help = ['spotify <query/link>', 'sp <query/link>']
handler.tags = ['internet']
handler.command = /^(spotify|sp)$/i
handler.limit = true

export default handler