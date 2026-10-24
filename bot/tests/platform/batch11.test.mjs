/* Tes batch 11: Auto-AI memakai Gemini (API sungguhan) dengan Groq sebagai cadangan. */
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  toGeminiPayload, chatGemini, getGeminiSettings, resetGeminiConfigCache,
  persistGeminiRuntimeConfig, geminiStatus, geminiBudget, resetGeminiUsage,
  DEFAULT_GEMINI_MODEL, GEMINI_FALLBACK_MODELS,
} from '../../lib/gemini-client.js'
import { aiProviderState, askAutoAiModel, planAutoAI } from '../../lib/auto-ai.js'

const GEMINI_KEY = 'AIzaSyTESTONLYkey000000000000000000000'
const AQ_KEY = 'AQ.Ab8TESTONLYkey00000000000000000000000000000000'
const GROQ_KEY = 'gsk_testonly000000000000000000000000'

async function withEnv(values, fn) {
  const saved = {}
  for (const [key, value] of Object.entries(values)) {
    saved[key] = process.env[key]
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  resetGeminiConfigCache()
  try {
    return await fn()
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    resetGeminiConfigCache()
  }
}

function stubFetch(handler) {
  const original = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options })
    return handler(String(url), options || {})
  }
  return { calls, restore: () => { globalThis.fetch = original } }
}

const reply = (text, extra = {}) => ({
  ok: true,
  status: 200,
  json: async () => ({ candidates: [{ content: { parts: [{ text }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 12, candidatesTokenCount: 5, totalTokenCount: 17 }, ...extra }),
})

/* ───────────── bentuk permintaan ───────────── */

test('model baku: seri 3.x (2.5 sudah ditutup untuk pengguna baru)', () => {
  assert.equal(DEFAULT_GEMINI_MODEL, 'gemini-3.5-flash')
  assert.deepEqual(GEMINI_FALLBACK_MODELS, ['gemini-3.6-flash', 'gemini-3.1-flash-lite'])
})

test('payload: system dipisah, peran assistant jadi model, jsonMode aktif', () => {
  const payload = toGeminiPayload([
    { role: 'system', content: 'Kamu Umi.' },
    { role: 'user', content: 'halo' },
    { role: 'assistant', content: 'hai' },
    { role: 'user', content: 'apa kabar' },
  ], { jsonMode: true, maxTokens: 500, temperature: 0.4 }, DEFAULT_GEMINI_MODEL)
  assert.equal(payload.systemInstruction.parts[0].text, 'Kamu Umi.')
  assert.deepEqual(payload.contents.map(entry => entry.role), ['user', 'model', 'user'])
  assert.equal(payload.generationConfig.responseMimeType, 'application/json')
  assert.equal(payload.generationConfig.maxOutputTokens, 500)
  assert.equal(payload.generationConfig.temperature, 0.4)
  assert.deepEqual(payload.generationConfig.thinkingConfig, { thinkingBudget: 0 })
})

test('payload: thinkingConfig hanya untuk model berfikir (2.5/3.x)', () => {
  const three = toGeminiPayload([{ role: 'user', content: 'x' }], {}, 'gemini-3.6-flash')
  assert.deepEqual(three.generationConfig.thinkingConfig, { thinkingBudget: 0 })
  const other = toGeminiPayload([{ role: 'user', content: 'x' }], { thinking: false }, 'gemini-1.5-flash')
  assert.equal(other.generationConfig?.thinkingConfig, undefined)
  const omitted = toGeminiPayload([{ role: 'user', content: 'x' }], { thinking: 'omit' }, 'gemini-3.5-flash')
  assert.equal(omitted.generationConfig?.thinkingConfig, undefined)
})

test('payload: tools gaya OpenAI diterjemahkan ke functionDeclarations', () => {
  const payload = toGeminiPayload([{ role: 'user', content: 'x' }], {
    tools: [{ type: 'function', function: { name: 'run_command', description: 'jalankan', parameters: { type: 'object', properties: { command: { type: 'string' } }, additionalProperties: false } } }],
  }, DEFAULT_GEMINI_MODEL)
  assert.equal(payload.tools[0].functionDeclarations[0].name, 'run_command')
  assert.equal(payload.tools[0].functionDeclarations[0].parameters.additionalProperties, undefined)
})

/* ───────────── panggilan API ───────────── */

test('chatGemini: kunci dikirim di header, bukan URL; jawaban dipakai apa adanya', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(() => reply('Halo, aku Umi.'))
    try {
      const result = await chatGemini([{ role: 'user', content: 'halo' }], { timeoutMs: 5000 })
      assert.equal(result.content, 'Halo, aku Umi.')
      assert.equal(result.provider, 'gemini')
      assert.equal(result.model, DEFAULT_GEMINI_MODEL)
      assert.equal(result.usage.total_tokens, 17)
      const call = stub.calls[0]
      assert.match(call.url, new RegExp(`/models/${DEFAULT_GEMINI_MODEL}:generateContent$`))
      assert.equal(call.url.includes(GEMINI_KEY), false, 'kunci tidak boleh di URL')
      assert.equal(call.options.headers['x-goog-api-key'], GEMINI_KEY)
      const body = JSON.parse(call.options.body)
      assert.equal(body.contents[0].parts[0].text, 'halo')
      assert.deepEqual(body.generationConfig.thinkingConfig, { thinkingBudget: 0 })
    } finally { stub.restore() }
  })
})

test('chatGemini: kunci salah dijawab jelas, tanpa membocorkan kunci', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(() => ({ ok: false, status: 400, json: async () => ({ error: { message: 'API key not valid. Please pass a valid API key.' } }) }))
    try {
      await assert.rejects(() => chatGemini([{ role: 'user', content: 'halo' }], { timeoutMs: 5000, fallbackModels: [] }), (error) => {
        assert.match(error.message, /Key Gemini tidak valid/i)
        assert.equal(error.message.includes(GEMINI_KEY), false)
        return true
      })
    } finally { stub.restore() }
  })
})

test('chatGemini: 429/503 pindah ke model cadangan', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(url => {
      if (url.includes(`${DEFAULT_GEMINI_MODEL}:`)) return { ok: false, status: 503, json: async () => ({ error: { message: 'high demand' } }) }
      return reply('dari model cadangan')
    })
    try {
      const result = await chatGemini([{ role: 'user', content: 'halo' }], { timeoutMs: 5000, fallbackModels: ['gemini-3.6-flash'] })
      assert.equal(result.content, 'dari model cadangan')
      assert.equal(result.model, 'gemini-3.6-flash')
      assert.equal(stub.calls.length, 2)
    } finally { stub.restore() }
  })
})

test('chatGemini: jawaban kosong/terpotong tidak dianggap sukses', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(() => ({ ok: true, status: 200, json: async () => ({ candidates: [{ content: { parts: [] }, finishReason: 'MAX_TOKENS' }] }) }))
    try {
      await assert.rejects(() => chatGemini([{ role: 'user', content: 'x' }], { timeoutMs: 5000, fallbackModels: [] }), /terpotong/i)
    } finally { stub.restore() }
  })
})

/* ───────────── kunci & status ───────────── */

test('persistGeminiRuntimeConfig menulis berkas mode 600 dan langsung terbaca', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-gemini-'))
  const file = path.join(dir, 'gemini.keyfile')
  await withEnv({ UMI_GEMINI_ENV_FILE: file, GEMINI_API_KEY: undefined }, async () => {
    assert.equal(getGeminiSettings().configured, false)
    persistGeminiRuntimeConfig({ apiKey: GEMINI_KEY, model: DEFAULT_GEMINI_MODEL })
    assert.equal(fs.statSync(file).mode & 0o777, 0o600)
    const settings = getGeminiSettings()
    assert.equal(settings.configured, true)
    assert.equal(settings.apiKey, GEMINI_KEY)
    assert.equal(settings.model, DEFAULT_GEMINI_MODEL)
    assert.equal(geminiStatus().apiKey, undefined, 'status tidak boleh memuat kunci')
  })
})

test('persistGeminiRuntimeConfig menerima kunci format baru "AQ."', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-gemini-aq-'))
  const file = path.join(dir, 'gemini.keyfile')
  await withEnv({ UMI_GEMINI_ENV_FILE: file, GEMINI_API_KEY: undefined }, async () => {
    assert.doesNotThrow(() => persistGeminiRuntimeConfig({ apiKey: AQ_KEY }))
    assert.equal(getGeminiSettings().apiKey, AQ_KEY)
  })
})

test('persistGeminiRuntimeConfig menolak kunci berformat aneh', () => {
  assert.throws(() => persistGeminiRuntimeConfig({ apiKey: 'pendek' }), /tidak valid/i)
})

test('anggaran token tercatat dari respons', async () => {
  resetGeminiUsage()
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(() => reply('ok'))
    try {
      await chatGemini([{ role: 'user', content: 'x' }], { timeoutMs: 5000 })
      assert.ok(geminiBudget().used >= 17)
    } finally { stub.restore() }
  })
})

/* ───────────── pemilihan penyedia ───────────── */

test('aiProviderState: Gemini didahulukan bila kuncinya ada', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, GROQ_API_KEY: GROQ_KEY, UMI_GEMINI_ENV_FILE: undefined }, async () => {
    const state = aiProviderState()
    assert.equal(state.provider, 'gemini')
    assert.equal(state.gemini.ready, true)
    assert.equal(state.groq.ready, true)
  })
})

test('aiProviderState: tanpa kunci sama sekali Auto-AI tidak aktif', async () => {
  await withEnv({ GEMINI_API_KEY: undefined, GROQ_API_KEY: undefined, UMI_GEMINI_ENV_FILE: path.join(os.tmpdir(), 'tidak-ada-gemini') }, async () => {
    globalThis.umiAutoAI = undefined
    assert.equal(aiProviderState().enabled, false)
    assert.equal(aiProviderState().provider, null)
  })
})

test('askAutoAiModel: Gemini gagal → Groq dipakai', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, GROQ_API_KEY: GROQ_KEY, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(url => {
      if (url.includes('gemini.test')) return { ok: false, status: 500, json: async () => ({ error: { message: 'down' } }) }
      return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'jawaban groq' } }], usage: { total_tokens: 9 } }) }
    })
    try {
      const result = await askAutoAiModel([{ role: 'user', content: 'halo' }], { timeoutMs: 5000 })
      assert.equal(result.provider, 'groq')
      assert.equal(result.content, 'jawaban groq')
    } finally { stub.restore() }
  })
})

test('askAutoAiModel: hanya Gemini terpasang → jawaban Gemini', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, GROQ_API_KEY: undefined, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(() => reply('jawaban gemini'))
    try {
      const result = await askAutoAiModel([{ role: 'user', content: 'halo' }], { timeoutMs: 5000 })
      assert.equal(result.provider, 'gemini')
      assert.equal(result.content, 'jawaban gemini')
    } finally { stub.restore() }
  })
})

test('Auto-AI benar-benar memanggil Gemini (bukan jawaban karangan)', async () => {
  await withEnv({ GEMINI_API_KEY: GEMINI_KEY, GROQ_API_KEY: undefined, UMI_GEMINI_ENV_FILE: undefined, GEMINI_API_BASE: 'https://gemini.test/v1beta' }, async () => {
    const stub = stubFetch(() => reply(JSON.stringify({ reply: 'Halo juga! Ada yang bisa kubantu?', commands: [] })))
    try {
      const plugin = Object.assign(async () => {}, { command: ['menu'], help: ['menu'], tags: ['main'] })
      const ctx = {
        m: { chat: 'g@g.us', sender: '1@s.whatsapp.net', text: '@111 halo', isGroup: true, mentionedJid: ['111@s.whatsapp.net'], key: { id: 'k1' } },
        conn: { user: { id: '111@s.whatsapp.net', jid: '111@s.whatsapp.net' } },
        botConfig: { scope: 'main', registrationRequired: false },
        isAdmin: false, isBotAdmin: false, isOwner: false, isPrems: false,
        userData: { registered: true, limit: 50, level: 100 },
        plugins: { 'main/menu.js': plugin },
      }
      const plan = await planAutoAI(ctx, { ignoreCooldown: true, ignoreBudget: true })
      assert.equal(plan.kind, 'answer')
      assert.match(plan.answer, /Halo juga/)
      const geminiCall = stub.calls.find(call => call.url.includes('gemini.test'))
      assert.ok(geminiCall, 'harus ada permintaan ke Gemini')
      assert.equal(JSON.parse(geminiCall.options.body).generationConfig.responseMimeType, 'application/json')
    } finally { stub.restore() }
  })
})
