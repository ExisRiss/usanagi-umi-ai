/* Shared, server-only Groq client. Never export keys in status responses. */
import fs from 'node:fs'
import path from 'node:path'

export const DEFAULT_GROQ_MODEL = 'openai/gpt-oss-120b'
const URL = 'https://api.groq.com/openai/v1/chat/completions'
let fileCache = { expires: 0, values: {} }
function privateEnvironment() {
  if (fileCache.expires > Date.now()) return fileCache.values
  const values = {}
  try {
    const file = fs.readFileSync(path.join(process.cwd(), '.env.groq'), 'utf8')
    for (const line of file.split(/\r?\n/)) {
      const match = line.match(/^\s*(GROQ_API_KEY|GROQ_MODEL|UMI_AUTO_AI_ENABLED)\s*=\s*(.*?)\s*$/)
      if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  } catch {}
  fileCache = { expires: Date.now() + 15_000, values }
  return values
}
export function resetGroqConfigCache() { fileCache.expires = 0 }
export function getGroqSettings() {
  const file = privateEnvironment()
  const apiKey = String(process.env.GROQ_API_KEY || file.GROQ_API_KEY || global.umiAutoAI?.apiKey || global.usanagiAI?.groqApiKey || '').trim()
  const model = String(process.env.GROQ_MODEL || file.GROQ_MODEL || global.umiAutoAI?.model || DEFAULT_GROQ_MODEL).trim()
  const enabled = String(process.env.UMI_AUTO_AI_ENABLED || file.UMI_AUTO_AI_ENABLED || 'true') !== 'false'
  return { apiKey, model, configured: Boolean(apiKey), enabled }
}
export function redactProviderSecrets(value) {
  return String(value ?? '').replace(/(?:gsk_|vcp_|ptl[ac]_|gh[pousr]_)[A-Za-z0-9_-]{16,}|sk-or-v1-[A-Za-z0-9_-]{16,}|github_pat_[A-Za-z0-9_]{16,}/g, '<redacted-key>')
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer <redacted>')
}
function parseDurationMs(raw) {
  const text = String(raw === null || raw === undefined ? '' : raw).trim().toLowerCase()
  if (!text) return 0
  if (/^[\d.]+ms$/.test(text)) return Math.round(Number(text.slice(0, -2)))
  let total = 0
  let matched = false
  const pattern = /(\d+(?:\.\d+)?)(h|m(?!s)|s)/g
  let part
  while ((part = pattern.exec(text))) {
    matched = true
    const value = Number(part[1])
    const unit = part[2]
    total += unit === 'h' ? value * 3_600_000 : unit === 'm' ? value * 60_000 : value * 1000
  }
  if (matched) return Math.round(total)
  const plain = Number(text)
  // Header `retry-after` tanpa satuan berarti detik.
  return Number.isFinite(plain) ? Math.round(plain * 1000) : 0
}
function rateLimitDelay(response, payload) {
  const headers = response && response.headers
  const header = name => (!headers ? '' : typeof headers.get === 'function' ? headers.get(name) : headers[name])
  const retryAfter = parseDurationMs(header('retry-after'))
  if (retryAfter) return retryAfter
  const reset = parseDurationMs(header('x-ratelimit-reset-tokens')) || parseDurationMs(header('x-ratelimit-reset-requests'))
  if (reset) return reset
  const message = String(payload?.error?.message || '')
  const match = message.match(/try again in\s+([\d.]+)\s*(ms|s|m)?/i)
  if (match) {
    const value = Number(match[1])
    const unit = (match[2] || 's').toLowerCase()
    return unit === 'ms' ? value : unit === 'm' ? value * 60_000 : value * 1000
  }
  return 0
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, Math.max(0, ms)))
// Sisa kuota token tiap model dicatat dari header Groq supaya permintaan
// berikutnya otomatis memakai model yang masih punya ruang (bukan selalu 120b).
const modelLimits = new Map()
// Pemakaian token per menit (dari field `usage` Groq) supaya Auto-AI tahu
// kapan harus menahan diri sebelum menembus 8.000 TPM.
const usageLog = []
export function recordGroqUsage(model, usage) {
  if (!usage) return
  usageLog.push({
    at: Date.now(),
    model,
    total: Number(usage.total_tokens || 0) || (Number(usage.prompt_tokens || 0) + Number(usage.completion_tokens || 0)),
  })
  const cutoff = Date.now() - 120_000
  while (usageLog.length && usageLog[0].at < cutoff) usageLog.shift()
}
export function groqBudget(windowMs = 60_000) {
  const since = Date.now() - windowMs
  let used = 0
  for (const row of usageLog) if (row.at >= since) used += row.total
  return { used, limit: 8000, remaining: Math.max(0, 8000 - used) }
}
function readLimitState(response) {
  const headers = response && response.headers
  if (!headers) return null
  const get = name => (typeof headers.get === 'function' ? headers.get(name) : headers[name])
  const remaining = get('x-ratelimit-remaining-tokens')
  if (remaining === null || remaining === undefined || remaining === '') return null
  return { remaining: Number(remaining) || 0, resetAt: Date.now() + (parseDurationMs(get('x-ratelimit-reset-tokens')) || 60_000) }
}

async function requestCompletion({ apiKey, model, body, timeout, options }) {
  const fetcher = options.fetchImpl || globalThis.fetch
  let response
  try {
    response = await fetcher(URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeout),
    })
  } catch (error) {
    const timedOut = ['TimeoutError', 'AbortError'].includes(error?.name)
    throw Object.assign(new Error(timedOut ? 'Groq melewati batas waktu. Coba lagi.' : 'Koneksi Groq tidak tersedia. Coba lagi.'), { status: timedOut ? 504 : 502 })
  }
  const limitState = readLimitState(response)
  if (limitState) modelLimits.set(model, limitState)
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    if (response.status === 429) {
      const waitMs = rateLimitDelay(response, payload)
      modelLimits.set(model, { remaining: 0, resetAt: Date.now() + (waitMs || 60_000) })
      const seconds = waitMs > 0 ? Math.max(1, Math.ceil(waitMs / 1000)) : 0
      const message = seconds
        ? `Batas Groq tercapai (8.000 token/menit). Coba lagi dalam ${seconds} detik.`
        : 'Batas penggunaan Groq tercapai. Tunggu sebentar lalu coba lagi.'
      throw Object.assign(new Error(message), { status: 429, retryAfterMs: waitMs })
    }
    const message = [401, 403].includes(response.status) ? 'Key Groq tidak valid atau akses model ditolak; hubungi owner.'
      : response.status === 400 ? 'Permintaan/model Groq tidak didukung. Hubungi owner.'
      : 'Groq sedang tidak dapat merespons.'
    throw Object.assign(new Error(message), { status: response.status >= 500 ? 502 : response.status })
  }
  const result = payload.choices?.[0]?.message
  if (!result || (!result.content && !result.tool_calls?.length)) throw Object.assign(new Error('Groq mengembalikan jawaban kosong. Coba lagi.'), { status: 502 })
  recordGroqUsage(model, payload.usage)
  return {
    role: 'assistant',
    content: result.content || null,
    ...(result.tool_calls?.length ? { tool_calls: result.tool_calls } : {}),
    usage: payload.usage || null,
  }
}

export async function chatGroq(messages, options = {}) {
  const settings = getGroqSettings()
  const apiKey = options.apiKey || settings.apiKey
  if (!apiKey) throw Object.assign(new Error('Groq belum dikonfigurasi oleh owner.'), { status: 503 })
  const timeout = Math.max(1, Math.min(Number(options.timeoutMs) || 20_000, 40_000))
  const primary = String(options.model || settings.model)
  // Batas Groq dihitung per model. Kalau model utama kena 429, model cadangan
  // (gpt-oss-20b) punya kuota sendiri sehingga Auto-AI tetap bisa menjawab.
  const ordered = [...new Set([primary, ...(options.fallbackModels || [])].filter(Boolean))]
  const now = Date.now()
  const models = ordered
    .map((model, index) => {
      const state = modelLimits.get(model)
      const remaining = state && state.resetAt > now ? state.remaining : 1_000_000
      return { model, index, remaining }
    })
    .sort((a, b) => b.remaining - a.remaining || a.index - b.index)
    .map(row => row.model)
  const bodyFor = model => {
    const body = { model, messages, max_completion_tokens: options.maxTokens || 1600, temperature: options.temperature ?? 0.25 }
    if (model.startsWith('openai/gpt-oss-')) body.reasoning_effort = options.reasoningEffort || 'low'
    if (options.jsonMode) body.response_format = { type: 'json_object' }
    if (options.tools?.length) Object.assign(body, { tools: options.tools, tool_choice: options.toolChoice || 'auto', parallel_tool_calls: false })
    return body
  }
  let lastError = null
  for (let index = 0; index < models.length; index += 1) {
    const model = models[index]
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await requestCompletion({ apiKey, model, body: bodyFor(model), timeout, options })
      } catch (error) {
        lastError = error
        if (error.status !== 429) throw error
        const waitMs = Number(error.retryAfterMs) || 0
        // Tunggu sebentar (maks 3 detik) lalu ulangi model yang sama sekali,
        // asalkan sisa waktu Auto-AI masih cukup.
        if (attempt === 0 && waitMs > 0 && waitMs <= 3000 && timeout > waitMs + 4000) {
          await sleep(waitMs + 250)
          continue
        }
        break
      }
    }
  }
  throw lastError || Object.assign(new Error('Groq tidak dapat merespons.'), { status: 502 })
}

export function persistGroqRuntimeConfig({apiKey,model}) {
  if(!/^gsk_[A-Za-z0-9_-]{20,200}$/.test(String(apiKey||''))) throw Object.assign(new Error('Format key Groq tidak valid.'),{status:400})
  if(!/^[A-Za-z0-9._:/-]{1,160}$/.test(String(model||''))) throw Object.assign(new Error('Format model tidak valid.'),{status:400})
  const enabled=getGroqSettings().enabled
  const file=path.join(process.cwd(),'.env.groq'),temp=file+'.tmp'
  fs.writeFileSync(temp,`GROQ_API_KEY=${apiKey}\nGROQ_MODEL=${model}\nUMI_AUTO_AI_ENABLED=${enabled}\n`,{mode:0o600})
  fs.renameSync(temp,file);try{fs.chmodSync(file,0o600)}catch{}
  resetGroqConfigCache()
}

/** Hapus kunci Groq dari `.env.groq` (model & saklar tetap tersimpan). */
export function clearGroqRuntimeConfig() {
  const current = getGroqSettings()
  const model = /^[A-Za-z0-9._:\/-]{1,160}$/.test(String(current.model || '')) ? current.model : DEFAULT_GROQ_MODEL
  const file = path.join(process.cwd(), '.env.groq')
  const temp = `${file}.tmp`
  fs.writeFileSync(temp, `GROQ_API_KEY=\nGROQ_MODEL=${model}\nUMI_AUTO_AI_ENABLED=${current.enabled}\n`, { mode: 0o600 })
  fs.renameSync(temp, file)
  try { fs.chmodSync(file, 0o600) } catch {}
  resetGroqConfigCache()
  return { configured: false, model, enabled: current.enabled }
}
