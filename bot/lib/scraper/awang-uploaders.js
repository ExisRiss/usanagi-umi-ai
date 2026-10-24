/* By AlzRiss - Usanagi Umi AI */

import uploadImage from './awang-imgdrop.js'

function mimeLookup(filename = '') {
  const ext = String(filename).toLowerCase().match(/\.([a-z0-9]+)$/)?.[1] || ''
  const map = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    avif: 'image/avif',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
    webm: 'video/webm',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    wav: 'audio/wav',
    pdf: 'application/pdf',
    zip: 'application/zip',
  }
  return map[ext] || 'application/octet-stream'
}

function withTimeout(timeoutMs) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  return { signal: controller.signal, clear: () => clearTimeout(timer) }
}

function appendFile(form, field, buffer, filename) {
  form.append(field, new Blob([buffer], { type: mimeLookup(filename) }), filename)
}

function parseCookieHeader(headers) {
  if (typeof headers.getSetCookie === 'function') return headers.getSetCookie().map((value) => value.split(';')[0]).join('; ')
  return headers.get('set-cookie')?.split(';')[0] || ''
}

function parseJson(text) {
  try { return JSON.parse(text) } catch { return null }
}

async function uploadToCatbox(buffer, filename) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  appendFile(form, 'fileToUpload', buffer, filename)
  const req = withTimeout(30000)
  try {
    const res = await fetch('https://catbox.moe/user/api.php', { method: 'POST', body: form, signal: req.signal })
    const url = (await res.text()).trim()
    if (!res.ok || !/^https?:\/\//i.test(url)) throw new Error('Catbox gagal')
    return { host: 'Catbox', url, expires: 'Permanen' }
  } finally {
    req.clear()
  }
}

async function uploadToLitterbox(buffer, filename) {
  const form = new FormData()
  form.append('reqtype', 'fileupload')
  form.append('time', '72h')
  appendFile(form, 'fileToUpload', buffer, filename)
  const req = withTimeout(30000)
  try {
    const res = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', { method: 'POST', body: form, signal: req.signal })
    const url = (await res.text()).trim()
    if (!res.ok || !/^https?:\/\//i.test(url)) throw new Error('Litterbox gagal')
    return { host: 'Litterbox', url, expires: '72 jam' }
  } finally {
    req.clear()
  }
}

async function uploadTo0x0(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'file', buffer, filename)
  const req = withTimeout(30000)
  try {
    const res = await fetch('https://0x0.st', { method: 'POST', body: form, signal: req.signal })
    const text = await res.text()
    const data = parseJson(text)
    const url = data?.files?.[0]?.url || data?.data?.url || data?.url || (text.trim().startsWith('http') ? text.trim() : '')
    if (!res.ok || !/^https?:\/\//i.test(url)) throw new Error('0x0 gagal')
    return { host: '0x0', url, expires: '60 menit' }
  } finally {
    req.clear()
  }
}

async function uploadToImgDrop(buffer, filename) {
  const data = await uploadImage(buffer, filename)
  if (!data.status || !data.url) throw new Error('ImgDrop gagal')
  return { host: 'ImgDrop', url: data.url, expires: 'Tidak diketahui' }
}

async function uploadToQuax(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'file', buffer, filename)
  const req = withTimeout(60000)
  try {
    const res = await fetch('https://qu.ax/upload.php', { method: 'POST', body: form, signal: req.signal })
    const data = await res.json()
    const url = data?.files?.[0]?.url
    if (!res.ok || !data?.success || !url) throw new Error('Qu.ax gagal')
    return { host: 'Qu.ax', url, expires: 'Permanen' }
  } finally {
    req.clear()
  }
}

async function uploadToTermai(buffer, filename) {
  const key = String(process.env.USANAGI_TERMAI_KEY || '').trim()
  if (!key) throw new Error('USANAGI_TERMAI_KEY belum diset')
  const form = new FormData()
  appendFile(form, 'file', buffer, filename)
  const req = withTimeout(120000)
  try {
    const res = await fetch(`https://c.termai.cc/api/upload?key=YOUR_API_KEY`, { method: 'POST', body: form, signal: req.signal })
    const data = await res.json()
    if (!res.ok || !data?.status || !data?.path) throw new Error('Termai gagal')
    return { host: 'Termai', url: data.path, expires: 'Tidak diketahui' }
  } finally {
    req.clear()
  }
}

async function uploadToPone(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'files[]', buffer, filename)
  const req = withTimeout(60000)
  try {
    const res = await fetch('https://pone.rs/upload.php', {
      method: 'POST',
      body: form,
      headers: { 'user-agent': 'Mozilla/5.0', accept: '*/*', origin: 'https://pone.rs', referer: 'https://pone.rs/' },
      signal: req.signal,
    })
    const data = await res.json()
    const url = data?.files?.[0]?.url?.replaceAll('\\/', '/')
    if (!res.ok || !data?.success || !url) throw new Error('Pone gagal')
    return { host: 'Pone', url, expires: 'Permanen' }
  } finally {
    req.clear()
  }
}

async function uploadToKappa(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'file', buffer, filename)
  const req = withTimeout(60000)
  try {
    const res = await fetch('https://kappa.lol/api/upload', {
      method: 'POST',
      body: form,
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: '*/*', Origin: 'https://kappa.lol', Referer: 'https://kappa.lol/' },
      signal: req.signal,
    })
    const data = parseJson(await res.text())
    if (!res.ok || !data?.link) throw new Error('Kappa gagal')
    return { host: 'Kappa', url: data.link, expires: 'Permanen' }
  } finally {
    req.clear()
  }
}

async function uploadToUploadEe(buffer, filename) {
  const ext = filename.match(/\.([^.]+)$/)?.[1]?.toLowerCase() || 'bin'
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'bmp', 'svg', 'avif'].includes(ext)
  const category = isImage ? 'cat_picture' : 'cat_file'
  const initReq = withTimeout(30000)
  let cookie = ''
  try {
    const initRes = await fetch('https://www.upload.ee/?', { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: initReq.signal })
    cookie = parseCookieHeader(initRes.headers)
  } finally {
    initReq.clear()
  }

  const idReq = withTimeout(30000)
  let uploadId = ''
  try {
    const idRes = await fetch('https://www.upload.ee/ubr_link_upload.php?rnd_id=' + Date.now(), { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://www.upload.ee/?', ...(cookie ? { cookie } : {}) }, signal: idReq.signal })
    uploadId = (await idRes.text()).match(/startUpload\("([^"]+)"/)?.[1] || ''
  } finally {
    idReq.clear()
  }
  if (!uploadId) throw new Error('Upload ID tidak ditemukan')

  const form = new FormData()
  appendFile(form, 'upfile_0', buffer, filename)
  form.append('link', '')
  form.append('email', '')
  form.append('category', category)
  form.append('big_resize', 'none')
  form.append('small_resize', '120x90')
  const uploadUrl = `https://www.upload.ee/cgi-bin/ubr_upload.pl?X-Progress-ID=${encodeURIComponent(uploadId)}&upload_id=${encodeURIComponent(uploadId)}`
  const uploadReq = withTimeout(120000)
  try {
    await fetch(uploadUrl, { method: 'POST', body: form, headers: { 'User-Agent': 'Mozilla/5.0', Origin: 'https://www.upload.ee', Referer: 'https://www.upload.ee/?', ...(cookie ? { cookie } : {}) }, signal: uploadReq.signal })
  } finally {
    uploadReq.clear()
  }

  const finishedReq = withTimeout(30000)
  try {
    const finishedRes = await fetch(`https://www.upload.ee/?page=finished&upload_id=${encodeURIComponent(uploadId)}`, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: uploadUrl, ...(cookie ? { cookie } : {}) }, signal: finishedReq.signal })
    const html = await finishedRes.text()
    const rawUrl = html.match(/id=["']file_src["'][^>]*value=["']([^"']+)["']/i)?.[1] || html.match(/View file:\s*<br\s*\/?\>\s*<a href=["']?([^"'>\s]+)["']?/i)?.[1] || ''
    let url = rawUrl.replaceAll('&amp;', '&').replaceAll('&quot;', '"')
    if (isImage) url = url.replace('/files/', '/image/').replace(/\.html$/, '')
    if (!finishedRes.ok || !/^https?:\/\//i.test(url)) throw new Error('Upload.ee gagal')
    return { host: 'Upload.ee', url, expires: 'Permanen' }
  } finally {
    finishedReq.clear()
  }
}

async function uploadToLeopard(buffer, filename) {
  const page = 'https://leopard.hosting.pecon.us/upload.php'
  const initReq = withTimeout(30000)
  try { await fetch(page, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: initReq.signal }) } finally { initReq.clear() }
  const form = new FormData()
  appendFile(form, 'uploadContent', buffer, filename)
  form.append('password', '')
  form.append('showname', 'yes')
  const req = withTimeout(120000)
  try {
    const res = await fetch(page, { method: 'POST', body: form, headers: { 'User-Agent': 'Mozilla/5.0', Origin: 'https://leopard.hosting.pecon.us', Referer: page }, signal: req.signal })
    const html = await res.text()
    const url = html.match(/Download link:\s*<a href=([^>\s]+)>/i)?.[1] || ''
    if (!res.ok || !/^https?:\/\//i.test(url)) throw new Error('Leopard gagal')
    return { host: 'Leopard', url, expires: 'Permanen' }
  } finally { req.clear() }
}

async function uploadToUguu(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'files[]', buffer, filename)
  const req = withTimeout(120000)
  try {
    const res = await fetch('https://uguu.se/upload.php', { method: 'POST', body: form, headers: { accept: '*/*', origin: 'https://uguu.se', referer: 'https://uguu.se/', 'user-agent': 'Mozilla/5.0' }, signal: req.signal })
    const data = await res.json()
    const url = data?.files?.[0]?.url
    if (!res.ok || !data?.success || !url) throw new Error('Uguu gagal')
    return { host: 'Uguu', url, expires: '48 jam' }
  } finally { req.clear() }
}

async function uploadTo8upload(buffer, filename) {
  const initReq = withTimeout(30000)
  let cookie = ''
  try {
    const initRes = await fetch('https://8upload.com/', { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: initReq.signal })
    cookie = parseCookieHeader(initRes.headers)
  } finally { initReq.clear() }

  const form = new FormData()
  appendFile(form, 'images[]', buffer, filename)
  const req = withTimeout(120000)
  let html = ''
  try {
    const res = await fetch('https://8upload.com/upload/mt/', { method: 'POST', body: form, headers: { accept: 'application/json, text/javascript, */*; q=0.01', origin: 'https://8upload.com', referer: 'https://8upload.com/', 'x-requested-with': 'XMLHttpRequest', 'user-agent': 'Mozilla/5.0', ...(cookie ? { cookie } : {}) }, signal: req.signal })
    html = await res.text()
  } finally { req.clear() }

  const uploadPath = html.trim().startsWith('/uploads/') ? html.trim() : html.match(/\/uploads\/[a-zA-Z0-9]+/)?.[0] || ''
  if (uploadPath) {
    const previewReq = withTimeout(30000)
    try {
      const previewRes = await fetch(`https://8upload.com${uploadPath}`, { headers: { 'User-Agent': 'Mozilla/5.0', Referer: 'https://8upload.com/', ...(cookie ? { cookie } : {}) }, signal: previewReq.signal })
      html = await previewRes.text()
    } finally { previewReq.clear() }
  }

  const url = html.match(/https:\/\/i\.8upload\.com\/image\/[^'"<>\s]+/)?.[0] || ''
  if (!url) throw new Error('8upload gagal')
  return { host: '8upload', url, expires: 'Permanen' }
}

async function uploadToTop4top(buffer, filename) {
  const initReq = withTimeout(30000)
  let sid = ''
  let cookie = ''
  try {
    const initRes = await fetch('https://top4top.io/', { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: initReq.signal })
    const html = await initRes.text()
    sid = html.match(/name=["']sid["'][^>]*value=["']([^"']+)["']/i)?.[1] || ''
    cookie = parseCookieHeader(initRes.headers)
  } finally { initReq.clear() }

  const form = new FormData()
  if (sid) form.append('sid', sid)
  appendFile(form, 'file_0_', buffer, filename)
  for (let i = 1; i <= 9; i++) form.append(`file_${i}_`, '')
  form.append('submitr', '[ رفع الملفات ]')
  for (let i = 0; i <= 9; i++) form.append(`file_${i}_`, '')

  const req = withTimeout(120000)
  try {
    const res = await fetch('https://top4top.io/index.php', { method: 'POST', body: form, headers: { accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', origin: 'https://top4top.io', referer: 'https://top4top.io/', 'user-agent': 'Mozilla/5.0', ...(cookie ? { cookie } : {}) }, signal: req.signal })
    const html = await res.text()
    const url = html.match(/value=["'](https:\/\/[^'"]*\/p_[^'"]*)['"]/i)?.[1] || html.match(/https:\/\/[^'"<>\s]*\/p_[^'"<>\s]*/)?.[0] || ''
    if (!res.ok || !/^https?:\/\//i.test(url)) throw new Error('Top4top gagal')
    return { host: 'Top4top', url, expires: 'Permanen' }
  } finally { req.clear() }
}

async function uploadToTmpFiles(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'file', buffer, filename)
  form.append('expire', '21600')
  const req = withTimeout(120000)
  try {
    const res = await fetch('https://tmpfiles.org/api/v1/upload', { method: 'POST', body: form, headers: { accept: 'application/json', 'user-agent': 'Mozilla/5.0' }, signal: req.signal })
    const data = await res.json()
    const url = data?.data?.url
    if (!res.ok || data?.status !== 'success' || !url) throw new Error('TmpFiles gagal')
    return { host: 'TmpFiles', url, expires: '6 jam' }
  } finally { req.clear() }
}

async function uploadToNekohime(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'file', buffer, filename)
  const req = withTimeout(120000)
  try {
    const res = await fetch('https://cdn.nekohime.site/upload', { method: 'POST', body: form, signal: req.signal })
    const data = await res.json()
    const raw = data?.files?.[0]?.url || data?.files?.url || (Array.isArray(data?.files) ? data.files[0] : data?.files)
    const url = typeof raw === 'string' ? raw : ''
    if (!res.ok || !url) throw new Error('Nekohime gagal')
    return { host: 'Nekohime', url, expires: 'Permanen' }
  } finally { req.clear() }
}

async function uploadToFaddlaninco(buffer, filename) {
  const form = new FormData()
  appendFile(form, 'file', buffer, filename)
  const req = withTimeout(120000)
  try {
    const res = await fetch('https://cdn.faddlaninco.dev/api/upload', { method: 'POST', body: form, signal: req.signal })
    const data = await res.json()
    if (!res.ok || !data?.success || !data?.url) throw new Error(data?.error || 'Faddlaninco gagal')
    return { host: 'Faddlaninco', url: data.url, expires: 'Permanen' }
  } finally { req.clear() }
}

async function uploadToUnggah(buffer, filename) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomPart = ''
  for (let i = 0; i < 16; i++) randomPart += chars.charAt(Math.floor(Math.random() * chars.length))
  const boundary = `WebKitFormBoundary${randomPart}`
  const contentType = mimeLookup(filename)
  const head = Buffer.from(`------${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: ${contentType}\r\n\r\n`)
  const tail = Buffer.from(`\r\n------${boundary}--\r\n`)
  const body = Buffer.concat([head, buffer, tail])
  const req = withTimeout(120000)
  try {
    const res = await fetch('https://unggah.web.id/api/unggah', { method: 'POST', headers: { 'content-type': `multipart/form-data; boundary=----${boundary}`, accept: '*/*', origin: 'https://unggah.web.id', referer: 'https://unggah.web.id/pengunggah', 'user-agent': 'Mozilla/5.0' }, body, signal: req.signal })
    const data = await res.json()
    if (!res.ok || !data?.url) throw new Error('Unggah gagal')
    return { host: 'Unggah', url: data.url, expires: 'Permanen' }
  } finally { req.clear() }
}

export const uploaders = [
  { name: 'ImgDrop', fn: uploadToImgDrop },
  { name: 'Catbox', fn: uploadToCatbox },
  { name: 'Litterbox', fn: uploadToLitterbox },
  { name: 'Pone', fn: uploadToPone },
  { name: 'Kappa', fn: uploadToKappa },
  { name: 'Uguu', fn: uploadToUguu },
  { name: 'TmpFiles', fn: uploadToTmpFiles },
  { name: 'Upload.ee', fn: uploadToUploadEe },
  { name: '8upload', fn: uploadTo8upload },
  { name: 'Top4top', fn: uploadToTop4top },
  { name: 'Leopard', fn: uploadToLeopard },
  { name: '0x0', fn: uploadTo0x0 },
  { name: 'Qu.ax', fn: uploadToQuax },
  { name: 'Termai', fn: uploadToTermai, optional: true },
  { name: 'Nekohime', fn: uploadToNekohime },
  { name: 'Faddlaninco', fn: uploadToFaddlaninco },
  { name: 'Unggah', fn: uploadToUnggah },
]

export { mimeLookup }
