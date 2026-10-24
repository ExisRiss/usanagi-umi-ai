/* By AlzRiss - Usanagi Umi AI */

export async function removeBackground(buffer, mime = 'image/jpeg', filename = 'image.jpg', options = {}) {
  if (!Buffer.isBuffer(buffer) || !buffer.length) throw new Error('Buffer gambar kosong')
  const url = options.endpoint || 'https://api2.pixelcut.app/image/matte/v1'
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 60000)
  try {
    const form = new FormData()
    form.append('image', new Blob([buffer], { type: mime }), filename)
    form.append('format', 'png')
    form.append('model', 'v1')
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36',
        Accept: 'application/json, text/plain, */*',
        'sec-ch-ua': '"Chromium";v="139", "Not;A=Brand";v="99"',
        'x-locale': 'en',
        'x-client-version': 'web:pixa.com:4a5b0af2',
        'sec-ch-ua-mobile': '?1',
        'sec-ch-ua-platform': '"Android"',
        origin: 'https://www.pixa.com',
        'sec-fetch-site': 'cross-site',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        referer: 'https://www.pixa.com/',
        'accept-language': 'id-ID,id;q=0.9,en-AU;q=0.8,en;q=0.7,en-US;q=0.6',
      },
      body: form,
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`RemoveBG HTTP ${response.status}`)
    const result = Buffer.from(await response.arrayBuffer())
    if (!result.length) throw new Error('Hasil RemoveBG kosong')
    return result
  } finally {
    clearTimeout(timer)
  }
}
