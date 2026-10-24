/*
 *
 * Salinan backup ke storage eksternal (bukan disk yang sama dengan database).
 *
 * Backend:
 *   vercel-blob  PUT object privat ke Vercel Blob (token BLOB_READ_WRITE_TOKEN)
 *   s3           S3-compatible (R2/MinIO/AWS) dengan SigV4, style path
 *
 * Setiap unggahan diverifikasi ulang lewat HEAD (ada + ukuran cocok) sebelum
 * backup ditandai aman di luar server.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const BLOB_HOST = 'https://blob.vercel-storage.com'

function hmac(key, value) {
  return crypto.createHmac('sha256', key).update(value).digest()
}

export function sha256Hex(data) {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/** URI-encode tiap segmen path gaya AWS (kecuali `/`). */
export function encodeS3Path(key) {
  return key
    .split('/')
    .map(segment => encodeURIComponent(segment).replace(/[!'()*]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`))
    .join('/')
}

/** Bangun header SigV4 untuk satu permintaan. Diekspor agar bisa diuji. */
export function signS3Request({ method, host, pathname, region, service = 's3', accessKeyId, secretAccessKey, payloadHash, extraHeaders = {}, now = new Date() }) {
  const amzDate = `${now.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`
  const dateStamp = amzDate.slice(0, 8)
  const headers = {
    host,
    'x-amz-content-sha256': payloadHash,
    'x-amz-date': amzDate,
    ...Object.fromEntries(Object.entries(extraHeaders).map(([key, value]) => [key.toLowerCase(), String(value)])),
  }
  const sortedKeys = Object.keys(headers).sort()
  const canonicalHeaders = sortedKeys.map(key => `${key}:${headers[key].trim()}\n`).join('')
  const signedHeaders = sortedKeys.join(';')
  const canonicalRequest = [method, pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')
  const scope = `${dateStamp}/${region}/${service}/aws4_request`
  const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, sha256Hex(canonicalRequest)].join('\n')
  const kDate = hmac(`AWS4${secretAccessKey}`, dateStamp)
  const kRegion = hmac(kDate, region)
  const kService = hmac(kRegion, service)
  const kSigning = hmac(kService, 'aws4_request')
  const signature = crypto.createHmac('sha256', kSigning).update(stringToSign).digest('hex')
  return {
    headers: {
      ...headers,
      authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    },
    amzDate,
    signature,
  }
}

async function putFileVercelBlob(cfg, file, key, meta) {
  const token = cfg.external.blob.token
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN belum diatur.')
  const pathname = `${cfg.external.blob.prefix}/${key}`
  const stat = fs.statSync(file)
  const response = await fetch(`${BLOB_HOST}/${pathname.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'PUT',
    headers: {
      authorization: `Bearer ${token}`,
      // x-api-version 12 memakai alur client-token; endpoint PUT klasik menolaknya
      // dengan "Invalid pathname", jadi header itu sengaja tidak dikirim.
      'content-type': 'application/gzip',
      'x-add-random-suffix': '0',
      'x-allow-overwrite': '1',
      'x-vercel-blob-access': 'private',
      'x-cache-control-max-age': '0',
      'content-length': String(stat.size),
    },
    body: fs.createReadStream(file),
    duplex: 'half',
    signal: AbortSignal.timeout(180_000),
  })
  const text = await response.text()
  if (!response.ok) throw new Error(`Vercel Blob menolak unggahan (${response.status}): ${text.slice(0, 200)}`)
  let payload = {}
  try { payload = JSON.parse(text) } catch {}
  const url = payload.url || ''
  // Verifikasi: HEAD dengan token; blob privat butuh Authorization.
  const head = await fetch(url, { method: 'HEAD', headers: { authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(30_000) })
  if (!head.ok) throw new Error(`Blob terunggah tapi gagal diverifikasi (${head.status}).`)
  const remoteBytes = Number(head.headers.get('content-length') || 0)
  return {
    backend: 'vercel-blob',
    key: pathname,
    url,
    bytes: remoteBytes,
    verified: remoteBytes === stat.size,
    meta,
  }
}

async function s3Request(cfg, { method, key, file, payloadHash, contentType }) {
  const s3 = cfg.external.s3
  const endpoint = new URL(s3.endpoint)
  const pathname = `/${s3.bucket}/${encodeS3Path(`${s3.prefix}/${key}`).replace(/^%2F/, '')}`
  const stat = file ? fs.statSync(file) : null
  const signed = signS3Request({
    method,
    host: endpoint.host,
    pathname,
    region: s3.region,
    accessKeyId: s3.accessKeyId,
    secretAccessKey: s3.secretAccessKey,
    payloadHash: payloadHash || sha256Hex(''),
    extraHeaders: contentType ? { 'content-type': contentType } : {},
  })
  const headers = { ...signed.headers }
  if (stat) headers['content-length'] = String(stat.size)
  const response = await fetch(`${s3.endpoint}${pathname}`, {
    method,
    headers,
    body: file ? fs.createReadStream(file) : undefined,
    duplex: 'half',
    signal: AbortSignal.timeout(180_000),
  })
  return { response, pathname }
}

async function putFileS3(cfg, file, key, meta) {
  const s3 = cfg.external.s3
  const payloadHash = await new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256')
    fs.createReadStream(file)
      .on('data', chunk => hash.update(chunk))
      .on('error', reject)
      .on('end', () => resolve(hash.digest('hex')))
  })
  const { response, pathname } = await s3Request(cfg, { method: 'PUT', key, file, payloadHash, contentType: 'application/gzip' })
  if (!response.ok) {
    const detail = await response.text().catch(() => '')
    throw new Error(`S3 menolak unggahan (${response.status}): ${detail.slice(0, 200)}`)
  }
  const head = await s3Request(cfg, { method: 'HEAD', key })
  if (!head.response.ok) throw new Error(`S3 upload tidak dapat diverifikasi (${head.response.status}).`)
  const remoteBytes = Number(head.response.headers.get('content-length') || 0)
  const localBytes = fs.statSync(file).size
  return {
    backend: 's3',
    key: `${s3.prefix}/${key}`,
    url: `${s3.endpoint}${pathname}`,
    bytes: remoteBytes,
    verified: remoteBytes === localBytes,
    meta,
  }
}

/** Unggah satu arsip ke backend eksternal aktif. */
export async function uploadToExternal(cfg, file, key, meta = {}) {
  const backend = cfg.external.backend
  if (backend === 'vercel-blob') return putFileVercelBlob(cfg, file, key, meta)
  if (backend === 's3') return putFileS3(cfg, file, key, meta)
  return null
}

/** Apakah snapshot ini perlu dikirim ke storage eksternal menurut mode. */
export function shouldUploadExternal(cfg, { startedAt, tier }) {
  const mode = cfg.external.mode
  if (cfg.external.backend === 'none') return false
  if (mode === 'all') return true
  if (mode === 'promoted') return tier === 'daily' || tier === 'weekly' || tier === 'monthly'
  // hourly: satu kali per jam UTC (menit < interval)
  const date = new Date(startedAt)
  return date.getUTCMinutes() < cfg.intervalMinutes
}

/** Cek koneksi backend tanpa mengunggah berkas nyata. */
export async function checkExternal(cfg) {
  if (cfg.external.backend === 'none') return { ok: false, backend: 'none', detail: 'storage eksternal belum diaktifkan' }
  if (cfg.external.backend === 'vercel-blob') {
    if (!cfg.external.blob.token) return { ok: false, backend: 'vercel-blob', detail: 'token belum diisi' }
    try {
      const response = await fetch(`${BLOB_HOST}/?limit=1`, {
        headers: { authorization: `Bearer ${cfg.external.blob.token}` },
        signal: AbortSignal.timeout(15_000),
      })
      return { ok: response.ok, backend: 'vercel-blob', detail: response.ok ? 'terhubung' : `HTTP ${response.status}` }
    } catch (error) {
      return { ok: false, backend: 'vercel-blob', detail: error.message }
    }
  }
  try {
    const { response } = await s3Request(cfg, { method: 'HEAD', key: '.health-probe', payloadHash: sha256Hex('') })
    // 404 berarti kredensial diterima tetapi objek belum ada — itu sehat.
    return { ok: response.ok || response.status === 404, backend: 's3', detail: response.ok ? 'terhubung' : `HTTP ${response.status}` }
  } catch (error) {
    return { ok: false, backend: 's3', detail: error.message }
  }
}

/** Hapus salinan eksternal (dipakai retensi agar storage tidak tumbuh tanpa batas). */
export async function deleteExternal(cfg, external) {
  if (!external || !external.key) return { deleted: false, reason: 'tidak ada salinan eksternal' }
  if (external.backend === 'vercel-blob') {
    const token = cfg.external.blob.token
    if (!token) return { deleted: false, reason: 'token blob tidak tersedia' }
    const url = external.url || ''
    if (!/^https:\/\/[a-z0-9-]+\.(?:private\.)?blob\.vercel-storage\.com\//i.test(url)) {
      return { deleted: false, reason: 'url blob tidak dikenal' }
    }
    const response = await fetch(`${BLOB_HOST}/delete`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({ urls: [url] }),
      signal: AbortSignal.timeout(30_000),
    })
    return { deleted: response.ok, status: response.status }
  }
  if (external.backend === 's3') {
    const s3 = cfg.external.s3
    const key = String(external.key || '').replace(new RegExp(`^${s3.prefix}/`), '')
    const { response } = await s3Request(cfg, { method: 'DELETE', key, payloadHash: sha256Hex('') })
    return { deleted: response.ok || response.status === 404, status: response.status }
  }
  return { deleted: false, reason: 'backend tidak dikenal' }
}
