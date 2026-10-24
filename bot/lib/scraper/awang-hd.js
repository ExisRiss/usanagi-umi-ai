/* By AlzRiss - Usanagi Umi AI */

import sharp from 'sharp'
import uploadImage from './awang-imgdrop.js'

const UA = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36'
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function makeTimeout(timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

function firstUrl(value) {
  if (typeof value === 'string' && /^https?:\/\//i.test(value)) return value
  if (Array.isArray(value)) return firstUrl(value[0])
  if (!value || typeof value !== 'object') return ''
  const keys = ['output', 'output_url', 'outputUrl', 'url', 'result_url', 'resultUrl', 'download_url', 'downloadUrl', 'image_url', 'imageUrl']
  for (const key of keys) {
    const url = firstUrl(value[key])
    if (url) return url
  }
  for (const key of ['result', 'data', 'response', 'images', 'files', 'downloadUrls', 'download_urls']) {
    const url = firstUrl(value[key])
    if (url) return url
  }
  return ''
}

async function parseMediaResponse(response) {
  const contentType = String(response.headers.get('content-type') || '').toLowerCase()
  const body = Buffer.from(await response.arrayBuffer())
  if (!body.length) throw new Error('Respons kosong')

  if (/^image\//i.test(contentType) || contentType.includes('octet-stream')) return body

  const text = body.toString('utf8').trim()
  if (!text) throw new Error('Respons kosong')

  let data = null
  try { data = JSON.parse(text) } catch {}
  const url = firstUrl(data) || (text.match(/https?:\/\/[^\s"']+/i)?.[0] || '')
  if (!url) throw new Error('Output gambar tidak ditemukan')
  return downloadUrl(url)
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 90000) {
  const timeout = makeTimeout(timeoutMs)
  try {
    return await fetch(url, { ...options, signal: timeout.signal })
  } finally {
    timeout.clear()
  }
}

async function downloadUrl(url, timeoutMs = 90000) {
  const response = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      Referer: 'https://aienhancer.ai/',
    },
  }, timeoutMs)
  if (!response.ok) throw new Error(`Download output HTTP ${response.status}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  if (!buffer.length) throw new Error('Output gambar kosong')
  return buffer
}

async function ensureJpeg(buffer) {
  try {
    return await sharp(buffer).jpeg({ quality: 95, chromaSubsampling: '4:4:4' }).toBuffer()
  } catch {
    return buffer
  }
}

async function aiEnhancer(buffer, options = {}) {
  const input = await ensureJpeg(buffer)
  const meta = await sharp(input).metadata()
  const mime = meta.format === 'png' ? 'image/png' : 'image/jpeg'
  const base64 = input.toString('base64')
  const timeoutMs = options.timeoutMs ?? 120000
  const headers = {
    'User-Agent': UA,
    'Content-Type': 'application/json',
    Origin: 'https://aienhancer.ai',
    Referer: 'https://aienhancer.ai/ai-image-upscaler',
  }
  const createResponse = await fetchWithTimeout(options.createEndpoint || 'https://aienhancer.ai/api/v1/r/image-enhance/create', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: options.model ?? 3,
      image: `data:${mime};base64,${base64}`,
      settings: options.settings || 'kRpBbpnRCD2nL2RxnnuoMo7MBc0zHndTDkWMl9aW+Gw=',
    }),
  }, timeoutMs)
  if (!createResponse.ok) throw new Error(`AIEnhancer create HTTP ${createResponse.status}`)
  const created = await createResponse.json()
  const taskId = created?.data?.id || created?.id || created?.data?.task_id || created?.task_id
  if (!taskId) throw new Error('AIEnhancer task id tidak ditemukan')

  const startedAt = Date.now()
  let lastStatus = ''
  while (Date.now() - startedAt < timeoutMs) {
    const resultResponse = await fetchWithTimeout(options.resultEndpoint || 'https://aienhancer.ai/api/v1/r/image-enhance/result', {
      method: 'POST',
      headers,
      body: JSON.stringify({ task_id: taskId }),
    }, 45000)
    if (!resultResponse.ok) throw new Error(`AIEnhancer result HTTP ${resultResponse.status}`)
    const payload = await resultResponse.json()
    const data = payload?.data || payload?.result || payload
    const outputUrl = firstUrl(data)
    if (outputUrl) return downloadUrl(outputUrl, 90000)
    lastStatus = String(data?.status || payload?.status || '').toLowerCase()
    if (['failed', 'error', 'cancelled', 'canceled'].includes(lastStatus)) throw new Error(`AIEnhancer status ${lastStatus}`)
    await sleep(lastStatus === 'queued' || lastStatus === 'pending' ? 2500 : 3200)
  }
  throw new Error(`AIEnhancer timeout${lastStatus ? ` (${lastStatus})` : ''}`)
}

async function ihancer(buffer, options = {}) {
  const input = await ensureJpeg(buffer)
  const timeout = makeTimeout(options.timeoutMs ?? 120000)
  try {
    const form = new FormData()
    form.append('method', String(options.method ?? 1))
    form.append('is_pro_version', 'true')
    form.append('is_enhancing_more', 'false')
    form.append('max_image_size', 'high')
    form.append('file', new Blob([input], { type: 'image/jpeg' }), 'file.jpg')
    const response = await fetch(options.endpoint || 'https://ihancer.com/api/enhance', {
      method: 'POST',
      headers: {
        'User-Agent': UA,
        Referer: 'https://ihancer.com/app/',
      },
      body: form,
      signal: timeout.signal,
    })
    if (!response.ok) throw new Error(`Ihancer HTTP ${response.status}`)
    return await parseMediaResponse(response)
  } finally {
    timeout.clear()
  }
}

async function imglarger(buffer, options = {}) {
  const input = await ensureJpeg(buffer)
  const type = Number(options.type ?? 13)
  const scale = Number(options.scale ?? 2)
  const timeoutMs = options.timeoutMs ?? 150000
  const uploadTimeout = makeTimeout(60000)
  try {
    const form = new FormData()
    form.append('myfile', new Blob([input], { type: 'image/jpeg' }), 'usanagi-hd.jpg')
    form.append('type', String(type))
    if ([0, 13].includes(type)) form.append('scaleRadio', String(scale))
    const uploadResponse = await fetch('https://photoai.imglarger.com/api/PhoAi/Upload', {
      method: 'POST',
      headers: {
        Accept: 'application/json, text/plain, */*',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        Origin: 'https://imglarger.com',
        Referer: 'https://imglarger.com/',
        'User-Agent': UA,
      },
      body: form,
      signal: uploadTimeout.signal,
    })
    if (!uploadResponse.ok) throw new Error(`ImgLarger upload HTTP ${uploadResponse.status}`)
    const uploadData = await uploadResponse.json()
    const code = uploadData?.data?.code || uploadData?.data?.id || uploadData?.code || uploadData?.result?.code
    if (!code) throw new Error('ImgLarger task code tidak ditemukan')

    const startedAt = Date.now()
    let lastStatus = ''
    while (Date.now() - startedAt < timeoutMs) {
      const pollTimeout = makeTimeout(45000)
      try {
        const statusResponse = await fetch('https://photoai.imglarger.com/api/PhoAi/CheckStatus', {
          method: 'POST',
          headers: {
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
            'Content-Type': 'application/json',
            Origin: 'https://imglarger.com',
            Referer: 'https://imglarger.com/',
            'User-Agent': UA,
          },
          body: JSON.stringify({ code, type }),
          signal: pollTimeout.signal,
        })
        if (!statusResponse.ok) throw new Error(`ImgLarger status HTTP ${statusResponse.status}`)
        const payload = await statusResponse.json()
        const data = payload?.data || payload?.result || payload
        const urls = data?.downloadUrls || data?.download_urls || data?.urls || []
        const outputUrl = firstUrl(urls) || firstUrl(data?.output)
        if (outputUrl) return downloadUrl(outputUrl, 90000)
        lastStatus = String(data?.status || payload?.status || '').toLowerCase()
        if (['error', 'failed', 'failure', 'cancelled', 'canceled'].includes(lastStatus)) throw new Error(`ImgLarger status ${lastStatus}`)
      } finally {
        pollTimeout.clear()
      }
      await sleep(lastStatus === 'processing' || lastStatus === 'running' ? 5000 : 4000)
    }
    throw new Error(`ImgLarger timeout${lastStatus ? ` (${lastStatus})` : ''}`)
  } finally {
    uploadTimeout.clear()
  }
}

async function urlEnhancer(buffer, endpoint, options = {}) {
  const uploaded = await uploadImage(buffer, `usanagi-${Date.now()}.jpg`, { timeoutMs: 60000 })
  if (!uploaded?.status || !uploaded?.url) throw new Error('Upload bridge tidak menghasilkan URL')
  const url = `${endpoint}${endpoint.includes('?') ? '&' : '?'}url=${encodeURIComponent(uploaded.url)}`
  const response = await fetchWithTimeout(url, {
    headers: {
      'User-Agent': UA,
      Accept: '*/*',
    },
  }, options.timeoutMs ?? 90000)
  if (!response.ok) throw new Error(`Enhancer API HTTP ${response.status}`)
  return parseMediaResponse(response)
}

async function unblur(buffer, options = {}) {
  const input = await ensureJpeg(buffer)
  const timeout = makeTimeout(options.timeoutMs ?? 90000)
  try {
    const form = new FormData()
    form.append('image', new Blob([input], { type: 'image/jpeg' }), 'image.jpg')
    const response = await fetch(options.endpoint || 'https://my.izuka-api.xyz/api/tools/unblur', {
      method: 'POST',
      body: form,
      signal: timeout.signal,
    })
    if (!response.ok) throw new Error(`Unblur HTTP ${response.status}`)
    const payload = await response.json()
    const outputUrl = firstUrl(payload?.result) || firstUrl(payload?.data) || firstUrl(payload)
    if (!outputUrl) throw new Error('Output unblur tidak tersedia')
    return downloadUrl(outputUrl, 90000)
  } finally {
    timeout.clear()
  }
}

async function localEnhance(buffer, options = {}) {
  const metadata = await sharp(buffer).metadata()
  const width = Number(metadata.width || 1000)
  const height = Number(metadata.height || 1000)
  const scale = Number(options.scale || 2)
  const maxSide = Number(options.maxSide || 4096)
  const ratio = Math.min(scale, maxSide / Math.max(width, height))
  const nextWidth = Math.max(1, Math.round(width * Math.max(1, ratio)))
  const nextHeight = Math.max(1, Math.round(height * Math.max(1, ratio)))
  const format = metadata.format === 'png' ? 'png' : 'jpeg'
  const pipeline = sharp(buffer)
    .resize(nextWidth, nextHeight, { fit: 'fill', kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: options.sigma || 1.25, m1: 1, m2: 2 })
  return format === 'png'
    ? pipeline.png({ compressionLevel: 9, effort: 6 }).toBuffer()
    : pipeline.jpeg({ quality: 95, chromaSubsampling: '4:4:4', mozjpeg: true }).toBuffer()
}

async function runEngines(buffer, engines) {
  const failures = []
  for (const engine of engines) {
    try {
      const result = await engine.run()
      if (!Buffer.isBuffer(result) || result.length < 100) throw new Error('Output tidak valid')
      return { buffer: result, engine: engine.name, failures }
    } catch (error) {
      failures.push(`${engine.name}: ${error?.message || 'gagal'}`)
    }
  }
  throw new Error(failures.join(' | ') || 'Semua engine gagal')
}

export async function enhanceHd(buffer) {
  return runEngines(buffer, [
    { name: 'AIEnhancer', run: () => aiEnhancer(buffer, { model: 3 }) },
    { name: 'Ihancer', run: () => ihancer(buffer, { method: 1 }) },
    { name: 'Azbry Remini', run: () => urlEnhancer(buffer, 'https://api.azbry.com/api/tools/remini') },
    { name: 'Local Super Resolution', run: () => localEnhance(buffer, { scale: 2, sigma: 1.25 }) },
  ])
}

export async function enhanceHd2(buffer) {
  return runEngines(buffer, [
    { name: 'ImgLarger Anime 2x', run: () => imglarger(buffer, { type: 13, scale: 2 }) },
    { name: 'ImgLarger Standard 2x', run: () => imglarger(buffer, { type: 0, scale: 2 }) },
    { name: 'Azbry HDImage', run: () => urlEnhancer(buffer, 'https://api.azbry.com/api/tools/hdimage') },
    { name: 'AIEnhancer', run: () => aiEnhancer(buffer, { model: 3 }) },
    { name: 'Local Super Resolution', run: () => localEnhance(buffer, { scale: 2, sigma: 1.4 }) },
  ])
}

export async function enhanceHd3(buffer) {
  return runEngines(buffer, [
    { name: 'Izuka Unblur', run: () => unblur(buffer) },
    { name: 'ImgLarger Deblur', run: () => imglarger(buffer, { type: 3 }) },
    { name: 'AIEnhancer Restore', run: () => aiEnhancer(buffer, { model: 3 }) },
    { name: 'Local Deblur Fallback', run: () => localEnhance(buffer, { scale: 2, sigma: 1.7 }) },
  ])
}

export async function ihancerLegacy(buffer, options = {}) {
  return ihancer(buffer, options)
}

export async function imglargerLegacy(buffer, options = {}) {
  return imglarger(buffer, options)
}

export { ihancer, imglarger, aiEnhancer, unblur, localEnhance }
