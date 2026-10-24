/**
 * Judul : Play Lagu dari Spotify
 * Base Url : spotidown.app
 */

import axios from 'axios'
import * as cheerio from 'cheerio'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

async function searchSpotiDown(query) {
  if (!query) {
    throw new Error('Query Spotify kosong')
  }

  try {
    // =========================================================
    // GET HOMEPAGE
    // =========================================================

    const resHome = await axios.get('https://spotidown.app/en6', {
      headers: {
        'User-Agent': USER_AGENT
      },
      timeout: 30000
    })

    // =========================================================
    // COOKIE
    // =========================================================

    const cookies = resHome.headers['set-cookie'] || []

    const cookieHeader = cookies
      .map(cookie => cookie.split(';')[0])
      .join('; ')

    // =========================================================
    // PARSE HIDDEN INPUT
    // =========================================================

    const $1 = cheerio.load(resHome.data)

    const hiddenInputs = {}

    $1('form[name="spotifyurl"] input[type="hidden"]').each((_, el) => {
      const name = $1(el).attr('name')
      const value = $1(el).attr('value') || ''

      if (name) {
        hiddenInputs[name] = value
      }
    })

    // =========================================================
    // ACTION REQUEST
    // =========================================================

    const paramsAction = new URLSearchParams()

    paramsAction.append('url', query)

    for (const [key, value] of Object.entries(hiddenInputs)) {
      paramsAction.append(key, value)
    }

    const resAction = await axios.post(
      'https://spotidown.app/action',
      paramsAction.toString(),
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type':
            'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: cookieHeader,
          Referer: 'https://spotidown.app/en6',
          Origin: 'https://spotidown.app',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 30000
      }
    )

    // =========================================================
    // PARSE RESPONSE
    // =========================================================

    let responseData = resAction.data

    if (typeof responseData === 'string') {
      try {
        responseData = JSON.parse(responseData)
      } catch {
        throw new Error('Response Spotidown tidak valid')
      }
    }

    if (responseData.error) {
      throw new Error(
        responseData.message || 'Gagal mencari lagu'
      )
    }

    if (!responseData.data) {
      throw new Error('Data lagu tidak ditemukan')
    }

    // =========================================================
    // PARSE TRACK FORM
    // =========================================================

    const $2 = cheerio.load(responseData.data)

    const firstForm = $2('form[name="submitspurl"]').first()

    if (!firstForm.length) {
      throw new Error('Lagu tidak ditemukan')
    }

    const rawData = firstForm
      .find('input[name="data"]')
      .val()

    const baseVal = firstForm
      .find('input[name="base"]')
      .val()

    const tokenVal = firstForm
      .find('input[name="token"]')
      .val()

    if (!rawData || !baseVal || !tokenVal) {
      throw new Error(
        'Data token download Spotify tidak ditemukan'
      )
    }

    // =========================================================
    // DECODE METADATA
    // =========================================================

    let trackMeta = {}

    try {
      const decoded = Buffer
        .from(rawData, 'base64')
        .toString('utf-8')

      trackMeta = JSON.parse(decoded)
    } catch {
      // metadata gagal decode, lanjutkan download
    }

    // =========================================================
    // TRACK DOWNLOAD REQUEST
    // =========================================================

    const paramsTrack = new URLSearchParams()

    paramsTrack.append('data', rawData)
    paramsTrack.append('base', baseVal)
    paramsTrack.append('token', tokenVal)

    const resTrack = await axios.post(
      'https://spotidown.app/action/track',
      paramsTrack.toString(),
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Content-Type':
            'application/x-www-form-urlencoded; charset=UTF-8',
          Cookie: cookieHeader,
          Referer: 'https://spotidown.app/en6',
          Origin: 'https://spotidown.app',
          'X-Requested-With': 'XMLHttpRequest'
        },
        timeout: 30000
      }
    )

    // =========================================================
    // PARSE DOWNLOAD RESPONSE
    // =========================================================

    let trackRespData = resTrack.data

    if (typeof trackRespData === 'string') {
      try {
        trackRespData = JSON.parse(trackRespData)
      } catch {
        throw new Error(
          'Response download Spotidown tidak valid'
        )
      }
    }

    if (trackRespData.error) {
      throw new Error(
        trackRespData.message ||
        'Gagal mendapatkan link download'
      )
    }

    let downloadUrl = null

    if (trackRespData.data) {
      const $dl = cheerio.load(trackRespData.data)

      downloadUrl =
        $dl('a.abutton[href]').attr('href') ||
        $dl('a[href*="download"]').attr('href') ||
        null
    }

    if (!downloadUrl) {
      throw new Error(
        'URL download Spotify tidak ditemukan'
      )
    }

    // =========================================================
    // RESULT
    // =========================================================

    return {
      status: true,
      title: trackMeta.name || null,
      artist: trackMeta.artist || null,
      album: trackMeta.album || null,
      duration: trackMeta.duration || null,
      image: trackMeta.cover || null,
      download_url: downloadUrl
    }

  } catch (error) {
    throw new Error(
      `Spotidown Error: ${error?.message || 'Unknown error'}`
    )
  }
}

// =============================================================
// EXPORT ESM
// =============================================================

export { searchSpotiDown }

export default {
  searchSpotiDown
}