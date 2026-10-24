/* By AlzRiss - Usanagi Umi AI
 *
 * Pengirim pesan dan berkas ke Telegram Bot API tanpa dependensi tambahan.
 *
 * Dipakai dua tempat:
 *   - `lib/auto-backup.js`  → arsip harian ke group bot utama (Task83)
 *   - `lib/backup/telegram.js` → bot administrasi backup
 *
 * Kenapa manual multipart? `sendDocument` untuk arsip 40 MB tidak boleh
 * dibaca dua kali ke memori (Buffer + Blob). Di sini berkas di-stream langsung
 * dari disk ke socket, jadi RAM tetap kecil walau bagiannya puluhan MB.
 *
 * Batas resmi Bot API: bot hanya boleh MENGIRIM berkas sampai 50 MB.
 */
import fs from 'node:fs'
import path from 'node:path'
import https from 'node:https'

const HOST = 'api.telegram.org'
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024
const TEXT_TIMEOUT_MS = 45_000
const UPLOAD_TIMEOUT_MS = 20 * 60 * 1000
const MAX_TEXT = 4096

function collect(response) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let bytes = 0
    response.on('data', chunk => {
      bytes += chunk.length
      // Balasan normal < 5 KB. Jaga-jaga bila Telegram mengirim halaman error.
      if (bytes > 1024 * 1024) {
        response.destroy(new Error('Balasan Telegram terlalu besar'))
        return
      }
      chunks.push(chunk)
    })
    response.on('end', () => resolve({ statusCode: response.statusCode, body: Buffer.concat(chunks).toString('utf8') }))
    response.on('error', reject)
  })
}

function toResult(method, statusCode, body) {
  let data = {}
  try { data = JSON.parse(body) } catch {}
  if (data && data.ok) return data.result
  const error = new Error(`${method}: ${(data && data.description) || `HTTP ${statusCode}`}`)
  error.statusCode = statusCode
  error.retryAfter = Number(data && data.parameters && data.parameters.retry_after) || 0
  error.telegramCode = data && data.error_code
  return error
}

function requestOptions(token, method, headers, timeoutMs) {
  return {
    host: HOST,
    port: 443,
    method: 'POST',
    path: `/bot${token}/${method}`,
    headers,
    timeout: timeoutMs,
  }
}

function jsonCall(token, method, payload, timeoutMs = TEXT_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const body = Buffer.from(JSON.stringify(payload), 'utf8')
    const req = https.request(requestOptions(token, method, {
      'Content-Type': 'application/json',
      'Content-Length': body.length,
    }, timeoutMs), response => {
      collect(response).then(({ statusCode, body: text }) => {
        const result = toResult(method, statusCode, text)
        if (result instanceof Error) reject(result)
        else resolve(result)
      }).catch(reject)
    })
    req.on('timeout', () => req.destroy(Object.assign(new Error(`${method}: timeout ${Math.round(timeoutMs / 1000)}s`), { code: 'ETIMEDOUT' })))
    req.on('error', reject)
    req.end(body)
  })
}

function multipartCall(token, method, fields, file, timeoutMs = UPLOAD_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    const boundary = `----umi${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`
    const head = []
    for (const [name, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') continue
      head.push(Buffer.from(
        `--${boundary}\r\nContent-Disposition: form-data; name="${name}"\r\n\r\n${value}\r\n`,
        'utf8'
      ))
    }
    const filename = String(file.filename || path.basename(file.path)).replace(/["\r\n]/g, '_')
    head.push(Buffer.from(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.field || 'document'}"; filename="${filename}"\r\n` +
      `Content-Type: ${file.mime || 'application/octet-stream'}\r\n\r\n`,
      'utf8'
    ))
    const headBuffer = Buffer.concat(head)
    const tailBuffer = Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8')
    const total = headBuffer.length + file.size + tailBuffer.length

    const req = https.request(requestOptions(token, method, {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': total,
    }, timeoutMs), response => {
      collect(response).then(({ statusCode, body }) => {
        const result = toResult(method, statusCode, body)
        if (result instanceof Error) reject(result)
        else resolve(result)
      }).catch(reject)
    })

    let settled = false
    const fail = error => {
      if (settled) return
      settled = true
      reject(error)
    }

    req.on('timeout', () => {
      req.destroy(Object.assign(new Error(`${method}: timeout ${Math.round(timeoutMs / 1000)}s`), { code: 'ETIMEDOUT' }))
    })
    req.on('error', error => {
      stream.destroy()
      fail(error)
    })

    const stream = fs.createReadStream(file.path)
    stream.on('error', error => {
      req.destroy()
      fail(error)
    })
    stream.on('end', () => {
      if (settled) return
      req.end(tailBuffer)
    })
    req.write(headBuffer)
    stream.pipe(req, { end: false })
  })
}

function retryable(error) {
  if (!error) return false
  if (error.statusCode === 429) return true
  if (error.statusCode >= 500) return true
  return ['ECONNRESET', 'ETIMEDOUT', 'EPIPE', 'ECONNABORTED', 'EAI_AGAIN', 'ENOTFOUND'].includes(error.code)
}

async function withRetry(label, task, attempts = 3) {
  let lastError = null
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task()
    } catch (error) {
      lastError = error
      if (!retryable(error) || attempt === attempts) break
      const waitMs = error.retryAfter
        ? Math.min(180_000, error.retryAfter * 1000)
        : Math.min(60_000, 4000 * 2 ** (attempt - 1))
      console.warn(`[TELEGRAM] ${label} gagal (${error.message}); coba lagi dalam ${Math.round(waitMs / 1000)}s`)
      await new Promise(resolve => setTimeout(resolve, waitMs))
    }
  }
  throw lastError
}

export async function getMe(token) {
  return withRetry('getMe', () => jsonCall(token, 'getMe', {}))
}

export async function sendMessage(token, chatId, text, { parseMode = 'HTML', disablePreview = true } = {}) {
  const payload = {
    chat_id: chatId,
    text: String(text).slice(0, MAX_TEXT),
    disable_web_page_preview: Boolean(disablePreview),
  }
  if (parseMode) payload.parse_mode = parseMode
  return withRetry('sendMessage', () => jsonCall(token, 'sendMessage', payload))
}

/**
 * Kirim satu berkas sebagai dokumen ke chat/group.
 * @returns {Promise<{messageId:number, fileId:string, size:number}>}
 */
export async function sendDocument(token, chatId, filePath, {
  caption = '',
  filename = '',
  mime = 'application/octet-stream',
  field = 'document',
  parseMode = 'HTML',
} = {}) {
  const stat = await fs.promises.stat(filePath)
  if (!stat.isFile()) throw new Error(`Bukan berkas: ${filePath}`)
  if (stat.size === 0) throw new Error(`Berkas kosong: ${path.basename(filePath)}`)
  if (stat.size > MAX_UPLOAD_BYTES) {
    throw new Error(`Berkas ${path.basename(filePath)} ${(stat.size / 1024 / 1024).toFixed(1)} MB melebihi batas Bot API 50 MB`)
  }
  const fields = {
    chat_id: chatId,
    caption: String(caption || '').slice(0, 1024),
    parse_mode: parseMode,
  }
  const message = await withRetry(`sendDocument ${path.basename(filePath)}`, () => multipartCall(token, 'sendDocument', fields, {
    path: filePath,
    filename: filename || path.basename(filePath),
    mime,
    size: stat.size,
    field,
  }))
  return {
    messageId: message && message.message_id,
    fileId: message && message.document && message.document.file_id,
    size: (message && message.document && message.document.file_size) || stat.size,
  }
}

export async function deleteMessage(token, chatId, messageId) {
  return withRetry('deleteMessage', () => jsonCall(token, 'deleteMessage', { chat_id: chatId, message_id: messageId }))
}

export default { MAX_UPLOAD_BYTES, getMe, sendMessage, sendDocument, deleteMessage }
