
import crypto from 'crypto'

const SIMPAN_SITE = 'https://simpan.site/api/upload'
const TEMPLATE = 'photo-to-ghibli-anime'

class AnimeConverter {
  constructor() {
    this.cookies = {}
    this.baseHeaders = {
      accept: '*/*',
      'accept-language': 'id-ID',
      'cache-control': 'no-cache',
      origin: 'https://www.photosstyle.com',
      pragma: 'no-cache',
      priority: 'u=1, i',
      referer: 'https://www.photosstyle.com/',
      'sec-ch-ua': '"Chromium";v="127", "Not)A;Brand";v="99", "Microsoft Edge Simulate";v="127"',
      'sec-ch-ua-mobile': '?1',
      'sec-ch-ua-platform': '"Android"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36'
    }

    this.setCookie('GUEST_ID', crypto.randomUUID())
    this.setCookie('user_fingerprint', crypto.randomUUID())
  }

  _log(msg) {
    console.log(`[AnimeConverter] ${msg}`)
  }

  setCookie(key, value) {
    if (key && value) this.cookies[key] = value
  }

  getCookieHeader() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join('; ')
  }

  async _req(url, options = {}) {
    const response = await fetch(url, {
      method: options.method || 'GET',
      headers: {
        ...this.baseHeaders,
        ...options.headers,
        cookie: this.getCookieHeader()
      },
      body: options.body
    })

    const setCookie = response.headers?.getSetCookie?.() || []
    for (const cookieStr of setCookie) {
      const main = cookieStr.split(';')[0]
      const [key, ...val] = main.split('=')
      if (key && val.length) this.cookies[key.trim()] = val.join('=').trim()
    }

    return response
  }

  async _toBuffer(input) {
    if (Buffer.isBuffer(input)) return input

    if (typeof input === 'string') {
      if (input.startsWith('http')) {
        const res = await fetch(input)
        return Buffer.from(await res.arrayBuffer())
      }

      if (
        /^data:image\/\w+;base64,/.test(input) ||
        /^[A-Za-z0-9+/=]+$/.test(input)
      ) {
        return Buffer.from(
          input.replace(/^data:image\/\w+;base64,/, ''),
          'base64'
        )
      }
    }

    throw new Error('Format gambar tidak valid.')
  }

  async _upload(buffer) {
    const filename = crypto.randomBytes(8).toString('hex') + '.jpg'

    const blob = new Blob([buffer], {
      type: 'image/jpeg'
    })

    const form = new FormData()
    form.append('file', blob, filename)

    const res = await this._req(
      'https://www.photosstyle.com/api/upload',
      {
        method: 'POST',
        body: form
      }
    )

    const json = await res.json()

    const url = json?.url || json?.data?.url

    if (!url) throw new Error('Upload gagal.')

    return url
  }

  async _poll(taskId) {
    for (let i = 1; i <= 60; i++) {
      await new Promise(resolve => setTimeout(resolve, 3000))

      const res = await this._req(
        `https://www.photosstyle.com/api/generation/task?taskId=${taskId}`
      )

      const json = await res.json()

      const status = json?.data?.status

      this._log(`Polling ${i}/60 : ${status}`)

      if (status === 'succeeded') return json.data

      if (status === 'failed' || status === 'error')
        throw new Error('Generation failed.')
    }

    throw new Error('Polling timeout.')
  }

  async _uploadToSimpan(url) {
    try {
      const img = await fetch(url)

      const buffer = Buffer.from(await img.arrayBuffer())

      const blob = new Blob([buffer], {
        type: 'image/png'
      })

      const form = new FormData()

      form.append('file', blob, 'anime-result.png')

      const upload = await fetch(SIMPAN_SITE, {
        method: 'POST',
        body: form
      })

      const json = await upload.json()

      if (json.success && json.files?.[0]) {
        return json.files[0].file.url
      }

      return null
    } catch {
      return null
    }
  }

  async generate({ imageUrl, upload = true }) {
    const buffer = await this._toBuffer(imageUrl)

    const uploaded = await this._upload(buffer)

    const payload = {
      urls: [uploaded],
      templateId: TEMPLATE,
      aspectRatio: '2:3',
      category: TEMPLATE,
      credit: '1',
      utm_source: null
    }

    const res = await this._req(
      'https://www.photosstyle.com/api/generation/chat',
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    )

    const json = await res.json()

    const taskId = json?.data?.id

    if (!taskId) throw new Error('Task ID tidak ditemukan.')

    const result = await this._poll(taskId)

    const resultUrl = result?.imgUrl

    let mirror = null

    if (upload && resultUrl) {
      mirror = await this._uploadToSimpan(resultUrl)
    }

    return {
      status: true,
      result: resultUrl,
      url: mirror
    }
  }
}

let handler = async (m, { conn }) => {
  let q = m.quoted || m

  let mime = q.mimetype || q.mediaType || ''

  if (!/image/.test(mime)) {
    throw 'Reply/Kirim gambar dengan caption *.ghibli*'
  }

  await m.reply('🎨 Sedang membuat anime...\nMohon tunggu sekitar 1-3 menit.')

  let media = await q.download()

  const api = new AnimeConverter()

  try {
    const result = await api.generate({
      imageUrl: media
    })

    if (!result.status) throw result.error || 'Gagal.'

    await conn.sendFile(
      m.chat,
      result.result,
      'ghibli.png',
      '✨ Berhasil membuat gambar anime.',
      m
    )
  } catch (e) {
    console.error(e)
    throw String(e)
  }
}

handler.help = ['ghibli']
handler.tags = ['ai']
handler.command = /^ghibli$/i

export default handler