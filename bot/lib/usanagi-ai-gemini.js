
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const AI_CONFIG = global.usanagiAI || {}
const DEFAULT_MODEL = String(AI_CONFIG.geminiModel || 'gemini-2.5-flash').trim()
const OFFICIAL_TIMEOUT = Number(AI_CONFIG.timeoutMs) || 120000
const WEB_TIMEOUT = Number(AI_CONFIG.webTimeoutMs) || 120000
const MAX_HISTORY_TURNS = Number(AI_CONFIG.historyTurns) || 12
const SESSION_TTL = 2 * 60 * 60 * 1000
const sessions = new Map()
const locks = new Map()
let webClient = null
let webClientState = null
let webSdkState = null

function loadWebSdk() {
  if (webSdkState) return webSdkState
  try {
    const sdk = require('gemini-web-sdk')
    if (!sdk?.Gemini) throw new Error('gemini-web-sdk tidak menyediakan Gemini.')
    webSdkState = sdk
    return sdk
  } catch (error) {
    webSdkState = { error }
    return webSdkState
  }
}

function normalizeText(value) {
  return String(value || '').replace(/\u0000/g, '').trim()
}

function encodeSession(data) {
  return Buffer.from(JSON.stringify(data), 'utf8').toString('base64url')
}

function decodeSession(value) {
  if (!value) return null
  try {
    const parsed = JSON.parse(Buffer.from(String(value), 'base64url').toString('utf8'))
    return parsed && typeof parsed === 'object' ? parsed : null
  } catch {
    return null
  }
}

function createSessionId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function cleanupSessions(now = Date.now()) {
  for (const [id, session] of sessions) {
    if (session?.updatedAt && now - session.updatedAt > SESSION_TTL) sessions.delete(id)
  }
}

async function withTimeout(task, timeout, label) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await task(controller.signal)
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(`${label} melebihi batas waktu ${Math.ceil(timeout / 1000)} detik.`)
    throw error
  } finally {
    clearTimeout(timer)
  }
}

async function withLock(id, task) {
  const previous = locks.get(id) || Promise.resolve()
  let release
  const current = new Promise(resolve => { release = resolve })
  locks.set(id, current)
  await previous
  try {
    return await task()
  } finally {
    release()
    if (locks.get(id) === current) locks.delete(id)
  }
}

function extractOfficialText(data) {
  const candidates = Array.isArray(data?.candidates) ? data.candidates : []
  const pieces = []
  for (const candidate of candidates) {
    const parts = candidate?.content?.parts
    if (!Array.isArray(parts)) continue
    for (const part of parts) {
      if (typeof part?.text === 'string') pieces.push(part.text)
    }
    if (pieces.length) break
  }
  return normalizeText(pieces.join('\n'))
}

function extractErrorMessage(data, fallback) {
  const message = data?.error?.message || data?.message
  if (typeof message === 'string' && message.trim()) return message.trim()
  return fallback
}

async function officialChat({ message, instruction, sessionId }) {
  const key = String(AI_CONFIG.geminiApiKey || '').trim()
  if (!key) throw new Error('Gemini API key belum diisi di config.js.')

  const decoded = decodeSession(sessionId)
  const id = decoded?.backend === 'official' && decoded?.id ? decoded.id : createSessionId('official')
  const record = sessions.get(id) || { history: [], updatedAt: 0 }
  const contents = [...record.history, {
    role: 'user',
    parts: [{ text: message }],
  }]

  const body = {
    systemInstruction: instruction ? { parts: [{ text: instruction }] } : undefined,
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 8192,
    },
  }

  const model = encodeURIComponent(DEFAULT_MODEL)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=YOUR_API_KEY`
  let lastError = null

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await withTimeout(signal => fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json',
        },
        body: JSON.stringify(body),
        signal,
      }), OFFICIAL_TIMEOUT, 'Request Gemini')
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(`Gemini API ${response.status}: ${extractErrorMessage(data, response.statusText || 'Request gagal')}`)
      }
      const text = extractOfficialText(data)
      if (!text) throw new Error('Gemini API mengembalikan response kosong.')

      record.history.push(contents.at(-1), {
        role: 'model',
        parts: [{ text }],
      })
      const maxEntries = Math.max(2, MAX_HISTORY_TURNS * 2)
      if (record.history.length > maxEntries) record.history = record.history.slice(-maxEntries)
      record.updatedAt = Date.now()
      sessions.set(id, record)

      return { text, sessionId: encodeSession({ backend: 'official', id }) }
    } catch (error) {
      lastError = error
      if (attempt < 1) await sleep(600)
    }
  }

  sessions.delete(id)
  throw lastError || new Error('Gemini API gagal memproses permintaan.')
}

function getWebClient() {
  if (webClient) return webClient
  const sdk = loadWebSdk()
  if (sdk?.error) throw new Error('Dependency gemini-web-sdk belum tersedia. Jalankan npm install terlebih dahulu.')
  const secureCookie = String(AI_CONFIG.geminiWebCookie || '').trim()
  const proxy = String(AI_CONFIG.geminiWebProxy || '').trim() || null
  webClient = new sdk.Gemini({
    ...(secureCookie ? { secure_1psid: secureCookie } : {}),
    ...(proxy ? { proxy } : {}),
    timeout: WEB_TIMEOUT,
    autoClose: false,
    maxResponseHeaderSize: 65536,
  })
  webClientState = secureCookie ? 'authenticated' : 'guest'
  return webClient
}

async function webChat({ message, instruction, sessionId }) {
  const client = getWebClient()
  const decoded = decodeSession(sessionId)
  const token = decoded?.backend === 'web' && decoded?.id ? decoded.id : createSessionId('web')
  let record = sessions.get(token)
  let chatSession = record?.chat || null

  if (!chatSession) {
    chatSession = client.newChat({ temporary: true })
    record = { chat: chatSession, initialized: false, updatedAt: 0 }
    sessions.set(token, record)
  }

  const prompt = instruction
    ? `${instruction}\n\nPesan pengguna saat ini:\n${message}`
    : message

  let response
  try {
    response = await chatSession.generateContent({ prompt })
  } catch (error) {
    sessions.delete(token)
    throw error
  }

  const text = normalizeText(response?.text)
  if (!text) {
    sessions.delete(token)
    throw new Error('Gemini Web mengembalikan response kosong.')
  }

  record.initialized = true
  record.updatedAt = Date.now()
  sessions.set(token, record)

  return { text, sessionId: encodeSession({ backend: 'web', id: token, mode: webClientState }) }
}

async function chat(input = {}) {
  cleanupSessions()
  const payload = typeof input === 'string' ? { message: input } : input || {}
  const message = normalizeText(payload.message)
  const instruction = normalizeText(payload.instruction)
  const sessionId = payload.sessionId || null
  if (!message) throw new Error('Message is required.')

  const decoded = decodeSession(sessionId)
  const backend = decoded?.backend || (AI_CONFIG.geminiApiKey ? 'official' : 'web')
  const lockId = decoded?.id || `${backend}:new:${message.slice(0, 32)}`

  return withLock(lockId, async () => {
    if (backend === 'official') {
      try {
        return await officialChat({ message, instruction, sessionId })
      } catch (officialError) {
        if (sessionId) throw officialError
        if (AI_CONFIG.geminiApiKey) {
          try {
            return await webChat({ message, instruction, sessionId: null })
          } catch (webError) {
            webError.cause = officialError
            throw webError
          }
        }
        throw officialError
      }
    }

    try {
      return await webChat({ message, instruction, sessionId })
    } catch (webError) {
      if (AI_CONFIG.geminiApiKey) {
        return officialChat({ message, instruction, sessionId: null })
      }
      throw webError
    }
  })
}

function clearSession(sessionId) {
  const decoded = decodeSession(sessionId)
  if (decoded?.id) sessions.delete(decoded.id)
}

export { chat, officialChat, webChat, clearSession, decodeSession, encodeSession }
export default chat
