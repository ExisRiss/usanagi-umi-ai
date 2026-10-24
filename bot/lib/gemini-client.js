/**
 * Klien Google Gemini untuk Auto-AI (server-only).
 *
 * Kenapa ada: Auto-AI sebelumnya hanya bisa memakai Groq. Gemini dipakai
 * sebagai penyedia utama bila kuncinya tersedia, dengan Groq sebagai cadangan
 * (lihat `lib/auto-ai.js`).
 *
 * Aturan rahasia:
 *  - Kunci TIDAK PERNAH ditaruh di URL (memakai header `x-goog-api-key`).
 *  - Kunci tidak pernah dikembalikan oleh status/health dan tidak masuk log;
 *    teks dari provider dilewatkan `redactProviderSecrets`.
 *
 * Sumber kunci (urutan prioritas):
 *  1. `options.apiKey`
 *  2. `process.env.GEMINI_API_KEY` / `GOOGLE_API_KEY`
 *  3. berkas `.env.gemini` di cwd (atau `UMI_GEMINI_ENV_FILE`)
 *  4. `global.umiAutoAI.geminiApiKey`, `global.usanagiAI.geminiApiKey`
 */
import fs from 'node:fs'
import path from 'node:path'
import { redactProviderSecrets } from './groq-client.js'

// Diuji langsung ke API (Okt 2026): `gemini-2.5-flash` sudah ditutup untuk
// pengguna baru ("no longer available to new users"), sedangkan seri 3.x jalan.
export const DEFAULT_GEMINI_MODEL = 'gemini-3.5-flash'
export const GEMINI_FALLBACK_MODELS = ['gemini-3.6-flash', 'gemini-3.1-flash-lite']
const BASE_URL = () => String(process.env.GEMINI_API_BASE || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/+$/, '')

let fileCache = { expires: 0, values: {} }

function envFile() {
  return process.env.UMI_GEMINI_ENV_FILE || path.join(process.cwd(), '.env.gemini')
}

function privateEnvironment() {
  if (fileCache.expires > Date.now()) return fileCache.values
  const values = {}
  try {
    const text = fs.readFileSync(envFile(), 'utf8')
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*(GEMINI_API_KEY|GEMINI_MODEL|UMI_AUTO_AI_ENABLED|GEMINI_TPM)\s*=\s*(.*?)\s*$/)
      if (match) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  } catch {}
  fileCache = { expires: Date.now() + 15_000, values }
  return values
}

export function resetGeminiConfigCache() { fileCache.expires = 0 }

/** Lokasi berkas kunci (`.env.gemini`), untuk ditampilkan di /aikey. */
export function geminiEnvFile() { return envFile() }

export function getGeminiSettings() {
  const file = privateEnvironment()
  const apiKey = String(
    process.env.GEMINI_API_KEY
    || process.env.GOOGLE_API_KEY
    || file.GEMINI_API_KEY
    || globalThis.umiAutoAI?.geminiApiKey
    || globalThis.usanagiAI?.geminiApiKey
    || '',
  ).trim()
  const model = String(process.env.GEMINI_MODEL || file.GEMINI_MODEL || globalThis.umiAutoAI?.geminiModel || DEFAULT_GEMINI_MODEL).trim()
  const enabled = String(process.env.UMI_AUTO_AI_ENABLED || file.UMI_AUTO_AI_ENABLED || 'true') !== 'false'
  const tpm = Number(process.env.GEMINI_TPM || file.GEMINI_TPM) || 250_000
  return { apiKey, model, enabled, configured: Boolean(apiKey), tpm, provider: 'gemini' }
}

/** Bentuk kunci yang diterima: AIza…, AQ.… (format AI Studio baru), ya29.… */
export function isValidGeminiKey(value) {
  const key = String(value || '').trim()
  return key.length >= 24 && key.length <= 400 && /^[A-Za-z0-9._-]+$/.test(key)
}

/** Status aman untuk ditampilkan (tanpa kunci). */
export function geminiStatus() {
  const settings = getGeminiSettings()
  return { provider: 'gemini', configured: settings.configured, model: settings.model, enabled: settings.enabled }
}

/* ─────────────────────── konversi format pesan ─────────────────────── */

function textOf(content) {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content.map(part => {
      if (typeof part === 'string') return part
      if (part?.type === 'text') return String(part.text || '')
      return ''
    }).filter(Boolean).join('\n')
  }
  return content == null ? '' : String(content)
}

/** Ubah `tools` gaya OpenAI menjadi `functionDeclarations` Gemini. */
export function toGeminiTools(tools) {
  if (!Array.isArray(tools) || !tools.length) return null
  const declarations = tools
    .map(tool => tool?.function || tool)
    .filter(tool => tool?.name)
    .map(tool => ({
      name: tool.name,
      ...(tool.description ? { description: tool.description } : {}),
      ...(tool.parameters ? { parameters: sanitizeSchema(tool.parameters) } : {}),
    }))
  return declarations.length ? [{ functionDeclarations: declarations }] : null
}

/** Gemini menolak `additionalProperties`; buang kunci yang tidak dikenal. */
function sanitizeSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema
  if (Array.isArray(schema)) return schema.map(sanitizeSchema)
  const out = {}
  for (const [key, value] of Object.entries(schema)) {
    if (['additionalProperties', '$schema', 'strict'].includes(key)) continue
    out[key] = key === 'properties' && value && typeof value === 'object'
      ? Object.fromEntries(Object.entries(value).map(([name, sub]) => [name, sanitizeSchema(sub)]))
      : sanitizeSchema(value)
  }
  return out
}

/**
 * Ubah daftar pesan gaya OpenAI menjadi `contents` + `systemInstruction`.
 * Dukungan tool: assistant `tool_calls` → `functionCall`, pesan role `tool` →
 * `functionResponse` (dipakai `umi-agent` bila nanti pindah provider).
 */
export function toGeminiPayload(messages = [], options = {}, model = '') {
  const systemParts = []
  const contents = []
  // Gemini butuh nama fungsi pada setiap functionResponse. Pesan role "tool"
  // gaya OpenAI hanya membawa tool_call_id, jadi namanya diambil dari
  // tool_calls asisten sebelumnya (dipakai agentChat di umi-agent.js).
  const callNames = new Map()
  const push = (role, parts) => {
    if (!parts.length) return
    const last = contents[contents.length - 1]
    if (last && last.role === role) last.parts.push(...parts)
    else contents.push({ role, parts })
  }
  for (const message of messages) {
    const role = String(message?.role || 'user')
    if (role === 'system' || role === 'developer') {
      const text = textOf(message.content)
      if (text) systemParts.push({ text })
      continue
    }
    if (role === 'tool') {
      const resolved = callNames.get(String(message.tool_call_id || ''))
      push('user', [{
        functionResponse: {
          name: String(message.name || message.tool_name || resolved || 'tool'),
          response: { result: textOf(message.content) },
        },
      }])
      continue
    }
    if (role === 'assistant' && Array.isArray(message.tool_calls) && message.tool_calls.length) {
      const parts = []
      const text = textOf(message.content)
      if (text) parts.push({ text })
      for (const call of message.tool_calls) {
        let args = {}
        try { args = JSON.parse(call?.function?.arguments || '{}') } catch { args = {} }
        const callName = String(call?.function?.name || 'tool')
        if (call?.id) callNames.set(String(call.id), callName)
        parts.push({ functionCall: { name: callName, args } })
      }
      push('model', parts)
      continue
    }
    const text = textOf(message.content)
    if (!text) continue
    push(role === 'assistant' ? 'model' : 'user', [{ text }])
  }
  const generationConfig = {}
  if (options.maxTokens) generationConfig.maxOutputTokens = Number(options.maxTokens)
  if (options.temperature !== undefined) generationConfig.temperature = Number(options.temperature)
  if (options.jsonMode) generationConfig.responseMimeType = 'application/json'
  // Gemini 2.5/3.x "berpikir" dulu sebelum menjawab; untuk balasan chat singkat
  // itu memakan token dan membuat jawaban terpotong (uji: 308 token vs 21).
  // Default mati, nyalakan hanya
  // bila pemanggil minta (`thinking: true`); 'omit' = jangan kirim kunci ini
  // sama sekali (dipakai saat model menolak thinkingConfig).
  if (options.thinking === 'omit') {
    // sengaja kosong
  } else if (/^gemini-(2\.5|3)/.test(model) && options.thinking !== true) {
    generationConfig.thinkingConfig = { thinkingBudget: 0 }
  }
  const payload = { contents }
  if (systemParts.length) payload.systemInstruction = { parts: systemParts }
  if (Object.keys(generationConfig).length) payload.generationConfig = generationConfig
  const tools = toGeminiTools(options.tools)
  if (tools) payload.tools = tools
  return payload
}

/* ─────────────────────────── kuota & permintaan ─────────────────────────── */

const usageLog = []

export function recordGeminiUsage(model, usage) {
  if (!usage) return
  const total = Number(usage.total_tokens || usage.totalTokenCount || 0)
    || (Number(usage.prompt_tokens || usage.promptTokenCount || 0) + Number(usage.completion_tokens || usage.candidatesTokenCount || 0))
  usageLog.push({ at: Date.now(), model, total })
  if (usageLog.length > 500) usageLog.splice(0, usageLog.length - 500)
}

export function geminiBudget(windowMs = 60_000) {
  const since = Date.now() - windowMs
  let used = 0
  for (const row of usageLog) if (row.at >= since) used += row.total
  const limit = getGeminiSettings().tpm
  return { used, limit, remaining: Math.max(0, limit - used) }
}

export function resetGeminiUsage() { usageLog.length = 0 }

const sleep = ms => new Promise(resolve => setTimeout(resolve, Math.max(0, ms)))

function usageToOpenAi(meta) {
  if (!meta) return null
  const prompt = Number(meta.promptTokenCount || 0)
  const completion = Number(meta.candidatesTokenCount || 0)
  return { prompt_tokens: prompt, completion_tokens: completion, total_tokens: Number(meta.totalTokenCount || prompt + completion) }
}

function errorFor(status, payload) {
  const raw = String(payload?.error?.message || '')
  const detail = redactProviderSecrets(raw).slice(0, 300)
  if (status === 400 && /API key not valid|API_KEY_INVALID/i.test(raw)) {
    return Object.assign(new Error('Key Gemini tidak valid; hubungi owner.'), { status: 401, providerMessage: detail })
  }
  if (status === 400) return Object.assign(new Error(`Permintaan Gemini ditolak: ${detail || 'format tidak didukung'}.`), { status: 400 })
  if ([401, 403].includes(status)) {
    // Dibedakan supaya pesan ke owner jujur: ACCESS_TOKEN_TYPE_UNSUPPORTED /
    // API_KEY_INVALID berarti key-nya sendiri sudah tidak berlaku (kedaluwarsa
    // atau dicabut), bukan soal izin model. Diperiksa 2026-10-20: key `AQ.…`
    // owner ditolak Google di semua model, jadi owner perlu memasang key baru.
    if (/ACCESS_TOKEN_TYPE_UNSUPPORTED|API_KEY_INVALID|API key not valid|API_KEY_SERVICE_BLOCKED/i.test(raw)) {
      return Object.assign(new Error('Key Gemini ditolak Google (tidak valid/kedaluwarsa). Pasang key baru lewat halaman AI Owner atau .env.gemini di server bot.'), { status: 401, providerMessage: detail })
    }
    return Object.assign(new Error('Key Gemini tidak punya akses ke model ini; hubungi owner.'), { status })
  }
  if (status === 404) return Object.assign(new Error('Model Gemini tidak ditemukan; hubungi owner.'), { status: 404 })
  if (status === 429) {
    const wait = (() => {
      const match = /retry in\s+(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?/i.exec(raw)
      if (!match) return ''
      const hours = Number(match[1] || 0); const minutes = Number(match[2] || 0); const seconds = Math.round(Number(match[3] || 0))
      const parts = []
      if (hours) parts.push(`${hours} jam`)
      if (minutes) parts.push(`${minutes} menit`)
      if (!hours && !minutes && seconds) parts.push(`${seconds} detik`)
      return parts.join(' ')
    })()
    const daily = /free_tier|per day|daily/i.test(raw) ? ' (kuota harian gratis)' : ''
    return Object.assign(new Error(`Kuota Gemini habis${daily}.${wait ? ` Coba lagi dalam ${wait}.` : ' Coba lagi sebentar.'}`), { status: 429 })
  }
  if (status === 503) return Object.assign(new Error('Gemini sedang sibuk. Coba lagi.'), { status: 503 })
  return Object.assign(new Error('Gemini sedang tidak dapat merespons.'), { status: status >= 500 ? 502 : status })
}

async function requestGenerate({ apiKey, model, payload, timeout, options }) {
  const fetcher = options.fetchImpl || globalThis.fetch
  const url = `${BASE_URL()}/models/${encodeURIComponent(model)}:generateContent`
  let response
  try {
    response = await fetcher(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(timeout),
    })
  } catch (error) {
    const timedOut = ['TimeoutError', 'AbortError'].includes(error?.name)
    throw Object.assign(new Error(timedOut ? 'Gemini melewati batas waktu. Coba lagi.' : 'Koneksi ke Gemini tidak tersedia. Coba lagi.'), { status: timedOut ? 504 : 502 })
  }
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw errorFor(Number(response.status) || 500, data)
  const candidate = data.candidates?.[0]
  if (candidate?.finishReason === 'SAFETY' || candidate?.finishReason === 'PROHIBITED_CONTENT') {
    throw Object.assign(new Error('Pertanyaan itu ditolak filter keamanan Gemini. Coba tulis dengan cara lain.'), { status: 422 })
  }
  const parts = candidate?.content?.parts || []
  const text = parts.filter(part => typeof part?.text === 'string').map(part => part.text).join('').trim()
  const calls = parts.filter(part => part?.functionCall).map((part, index) => ({
    id: `gemini_call_${Date.now()}_${index}`,
    type: 'function',
    function: { name: String(part.functionCall.name || 'tool'), arguments: JSON.stringify(part.functionCall.args || {}) },
  }))
  if (!text && !calls.length) {
    const reason = String(candidate?.finishReason || '')
    if (reason === 'MAX_TOKENS') {
      throw Object.assign(new Error('Jawaban Gemini terpotong karena batas token. Coba lagi.'), { status: 502 })
    }
    throw Object.assign(new Error('Gemini mengembalikan jawaban kosong. Coba lagi.'), { status: 502 })
  }
  const usage = usageToOpenAi(data.usageMetadata)
  recordGeminiUsage(model, usage)
  return {
    role: 'assistant',
    content: text || null,
    ...(calls.length ? { tool_calls: calls } : {}),
    usage,
    provider: 'gemini',
    model,
  }
}

/**
 * Panggil Gemini. Bentuk kembalian sama dengan `chatGroq` supaya pemanggil
 * (Auto-AI) tidak perlu tahu penyedianya.
 */
export async function chatGemini(messages, options = {}) {
  const settings = getGeminiSettings()
  const apiKey = String(options.apiKey || settings.apiKey || '').trim()
  if (!apiKey) throw Object.assign(new Error('Gemini belum dikonfigurasi oleh owner.'), { status: 503 })
  const timeout = Math.max(1, Math.min(Number(options.timeoutMs) || 20_000, 45_000))
  const primary = String(options.model || settings.model || DEFAULT_GEMINI_MODEL)
  const models = [...new Set([primary, ...(options.fallbackModels || GEMINI_FALLBACK_MODELS)].filter(Boolean))]
  let lastError = null
  // Error model utama disimpan terpisah: kalau model cadangan ditolak (401/404)
  // atau ikut kena 429, pesan yang dilaporkan tetap menjelaskan penyebab utama.
  let primaryError = null
  for (let modelIndex = 0; modelIndex < models.length; modelIndex += 1) {
    const model = models[modelIndex]
    let thinking = options.thinking
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const payload = toGeminiPayload(messages, { ...options, thinking }, model)
      try {
        return await requestGenerate({ apiKey, model, payload, timeout, options })
      } catch (error) {
        lastError = error
        if (modelIndex === 0) primaryError = error
        // Model lama menolak `thinkingConfig` → ulangi sekali tanpa itu.
        if (attempt === 0 && Number(error?.status) === 400 && /thinking/i.test(String(error.message))) {
          thinking = 'omit'
          continue
        }
        // 429/503 = gangguan sementara: coba model lain (kuota terpisah).
        if (![429, 503].includes(Number(error?.status))) {
          // Model utama gagal permanen (key/model salah) → laporkan apa adanya.
          // Model cadangan yang ditolak (401/404) jangan menutupi error utama.
          if (modelIndex === 0) throw error
          break
        }
        if (attempt === 0 && Number(error?.retryAfterMs) > 0 && Number(error.retryAfterMs) <= 2000) {
          await sleep(Number(error.retryAfterMs) + 150)
          continue
        }
        break
      }
    }
  }
  throw primaryError || lastError || Object.assign(new Error('Gemini tidak dapat merespons.'), { status: 502 })
}

/** Simpan kunci ke `.env.gemini` (mode 600) supaya bertahan setelah restart. */
export function persistGeminiRuntimeConfig({ apiKey, model } = {}) {
  const key = String(apiKey || '').trim()
  if (!/^[A-Za-z0-9._-]{20,200}$/.test(key)) throw Object.assign(new Error('Format key Gemini tidak valid.'), { status: 400 })
  const chosen = String(model || getGeminiSettings().model || DEFAULT_GEMINI_MODEL)
  if (!/^[A-Za-z0-9._-]{1,120}$/.test(chosen)) throw Object.assign(new Error('Format model Gemini tidak valid.'), { status: 400 })
  const file = envFile()
  const temp = `${file}.tmp`
  fs.writeFileSync(temp, `GEMINI_API_KEY=${key}\nGEMINI_MODEL=${chosen}\nUMI_AUTO_AI_ENABLED=${getGeminiSettings().enabled}\n`, { mode: 0o600 })
  fs.renameSync(temp, file)
  try { fs.chmodSync(file, 0o600) } catch {}
  resetGeminiConfigCache()
  return { configured: true, model: chosen }
}

/** Hapus kunci Gemini dari `.env.gemini` (model & saklar tetap tersimpan). */
export function clearGeminiRuntimeConfig() {
  const current = getGeminiSettings()
  const model = /^[A-Za-z0-9._-]{1,120}$/.test(String(current.model || '')) ? current.model : DEFAULT_GEMINI_MODEL
  const file = envFile()
  const temp = `${file}.tmp`
  fs.writeFileSync(temp, `GEMINI_API_KEY=\nGEMINI_MODEL=${model}\nUMI_AUTO_AI_ENABLED=${current.enabled}\n`, { mode: 0o600 })
  fs.renameSync(temp, file)
  try { fs.chmodSync(file, 0o600) } catch {}
  resetGeminiConfigCache()
  return { configured: false, model, enabled: current.enabled }
}

export default {
  DEFAULT_GEMINI_MODEL,
  isValidGeminiKey,
  getGeminiSettings,
  geminiStatus,
  geminiBudget,
  geminiEnvFile,
  chatGemini,
  persistGeminiRuntimeConfig,
  clearGeminiRuntimeConfig,
}
