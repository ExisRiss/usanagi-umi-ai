import { chatGroq, getGroqSettings, DEFAULT_GROQ_MODEL, redactProviderSecrets, persistGroqRuntimeConfig } from './groq-client.js'
import { chatGemini, getGeminiSettings, isValidGeminiKey, persistGeminiRuntimeConfig, DEFAULT_GEMINI_MODEL } from './gemini-client.js'
/* Usanagi Umi Agent — server-side OpenRouter agent runtime */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'data', 'umi-agent')
const WORKSPACE_ROOT = path.join(DATA_DIR, 'workspaces')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.enc.json')
const AUDIT_FILE = path.join(DATA_DIR, 'audit.jsonl')
const STATUS_FILE = path.join(DATA_DIR, 'status.json')
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions'
const DEFAULT_MODEL = 'openrouter/auto'
const MAX_PROMPT = 12000
const MAX_HISTORY = 14
const MAX_TOOL_CALLS = 4
const MAX_WORKSPACE_FILE = 128 * 1024
const MAX_COMMAND_OUTPUT = 12000
const WORKSPACE_TTL_MS = 14 * 24 * 60 * 60 * 1000

let workerTimer = null
let runtimeSecretProvider = null

function ensureDirs() {
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true, mode: 0o700 })
  try { fs.chmodSync(DATA_DIR, 0o700) } catch {}
}

function safeText(value, max = 500) {
  return String(value ?? '').replace(/\u0000/g, '').trim().slice(0, max)
}

function redact(value) {
  return redactProviderSecrets(value)
    .replace(/gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}/gi, '<redacted-github-token>')
    .replace(/sk-or-v1-[A-Za-z0-9_-]{16,}/gi, '<redacted-openrouter-key>')
    .replace(/Bearer\s+[A-Za-z0-9._~+\/-]{16,}/gi, 'Bearer <redacted>')
    .replace(/(?:eyJ[A-Za-z0-9_-]{10,}\.){2}[A-Za-z0-9_-]{10,}/g, '<redacted-jwt>')
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, '<redacted-private-key>')
    .replace(/\b(?:62|0)8\d{8,13}\b/g, '<redacted-phone>')
    .replace(/(?:UMI|GROQ)_[A-Z0-9_]*=\S+/g, '<redacted-environment>')
}

function audit(event, metadata = {}) {
  try {
    ensureDirs()
    const safe = {}
    for (const [key, value] of Object.entries(metadata || {})) safe[key] = redact(safeText(value, 1600))
    fs.appendFileSync(AUDIT_FILE, `${JSON.stringify({ at: new Date().toISOString(), event, ...safe })}\n`, { mode: 0o600 })
  } catch {}
}

function keyMaterial() {
  const value = String(runtimeSecretProvider?.() || '')
  if (value.length < 32) throw Object.assign(new Error('Agent runtime secret belum dikonfigurasi.'), { status: 503 })
  return crypto.hkdfSync('sha256', Buffer.from(value), Buffer.from('umi-agent-salt-v1'), Buffer.from('umi-agent-settings'), 32)
}

function encryptSecret(value) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', keyMaterial(), iv)
  const encrypted = Buffer.concat([cipher.update(String(value), 'utf8'), cipher.final()])
  return { iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), data: encrypted.toString('base64url') }
}

function decryptSecret(payload) {
  if (!payload?.iv || !payload?.tag || !payload?.data) return ''
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyMaterial(), Buffer.from(payload.iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64url'))
  return Buffer.concat([decipher.update(Buffer.from(payload.data, 'base64url')), decipher.final()]).toString('utf8')
}

function readSettings() {
  ensureDirs()
  const groq = getGroqSettings()
  const gemini = getGeminiSettings()
  let data = {}
  try { data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8')) } catch {}
  let legacyKey = '', groqKey = '', geminiKey = ''
  try { legacyKey = decryptSecret(data.openrouter) } catch {}
  try { groqKey = decryptSecret(data.groq) } catch {}
  try { geminiKey = decryptSecret(data.gemini) } catch {}
  const stored = ['groq','openrouter','gemini'].includes(data.provider) ? data.provider : ''
  // Tanpa pilihan tersimpan: ikuti key yang paling siap. Gemini didahulukan
  // karena .env.gemini diisi owner untuk AI Agent & AI Owner.
  const provider = stored || (legacyKey ? 'openrouter' : gemini.configured ? 'gemini' : 'groq')
  const storedModel = safeText(data.models && data.models[provider],160) || (data.provider === provider ? safeText(data.model,160) : '')
  const model = storedModel
    || (provider === 'groq' ? groq.model : provider === 'gemini' ? gemini.model : DEFAULT_MODEL)
  const apiKey = provider === 'groq' ? (groqKey || groq.apiKey)
    : provider === 'gemini' ? (geminiKey || gemini.apiKey)
    : legacyKey
  return {
    provider,
    model,
    apiKey,
    updatedAt: safeText(data.updatedAt,64), updatedBy:safeText(data.updatedBy,80),
  }
}

function writeSettings({apiKey,model,provider,updatedBy}) {
  const previous=readSettings()
  const selected=['groq','openrouter','gemini'].includes(provider)?provider:previous.provider
  let stored={}
  try{stored=JSON.parse(fs.readFileSync(SETTINGS_FILE,'utf8'))}catch{}
  let savedKey=''
  try{savedKey=decryptSecret(stored[selected])}catch{}
  const fallbackKey=selected==='groq'?getGroqSettings().apiKey:selected==='gemini'?getGeminiSettings().apiKey:''
  const key=safeText(apiKey,1000)||savedKey||(selected===previous.provider?previous.apiKey:fallbackKey)
  if(!key||key.length<16)throw Object.assign(new Error('API key untuk provider ini belum dikonfigurasi.'),{status:400})
  if(selected==='groq'&&!/^gsk_[A-Za-z0-9_-]{20,200}$/.test(key))throw Object.assign(new Error('Format key Groq tidak valid.'),{status:400})
  if(selected==='gemini'&&!isValidGeminiKey(key))throw Object.assign(new Error('Format key Gemini tidak valid.'),{status:400})
  const defaultModel=selected==='groq'?DEFAULT_GROQ_MODEL:selected==='gemini'?getGeminiSettings().model||DEFAULT_GEMINI_MODEL:DEFAULT_MODEL
  const selectedModel=safeText(model,160)||(stored.models&&stored.models[selected])||(selected===previous.provider?previous.model:defaultModel)
  if(!/^[A-Za-z0-9._:/-]{1,160}$/.test(selectedModel))throw Object.assign(new Error('Format model tidak valid.'),{status:400})
  const next={...stored,version:2,provider:selected,model:selectedModel,models:{...(stored.models||{}),[previous.provider]:previous.model,[selected]:selectedModel},[selected]:encryptSecret(key),updatedAt:new Date().toISOString(),updatedBy:safeText(updatedBy,80)}
  ensureDirs()
  // Groq & Gemini menulis berkas runtime 600 supaya Auto-AI / restart tetap
  // memakai key yang sama; OpenRouter hanya disimpan terenkripsi di sini.
  if(selected==='groq')persistGroqRuntimeConfig({apiKey:key,model:next.model})
  if(selected==='gemini')persistGeminiRuntimeConfig({apiKey:key,model:next.model})
  const temp=`${SETTINGS_FILE}.${process.pid}.tmp`
  fs.writeFileSync(temp,`${JSON.stringify(next)}\n`,{mode:0o600});fs.renameSync(temp,SETTINGS_FILE)
  audit('agent.settings.updated',{actor:updatedBy,provider:selected,model:next.model})
  return agentStatus()
}

function workspaceId(userId) {
  return crypto.createHash('sha256').update(String(userId || 'guest')).digest('hex').slice(0, 40)
}

function workspaceFor(userId) {
  ensureDirs()
  const dir = path.join(WORKSPACE_ROOT, workspaceId(userId))
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  return dir
}

function workspacePath(userId, name) {
  const clean = safeText(name, 180).replace(/\\/g, '/').replace(/^\/+/, '')
  const parts = clean.split('/')
  if (!clean || clean.includes('..') || !/^[A-Za-z0-9._/-]+$/.test(clean) || parts.some(part => part === '.agent-history.json')) throw new Error('Nama file workspace tidak valid.')
  const root = workspaceFor(userId)
  const target = path.resolve(root, clean)
  if (!target.startsWith(`${root}${path.sep}`)) throw new Error('Akses workspace ditolak.')
  return target
}

function listWorkspace(userId) {
  const root = workspaceFor(userId)
  const result = []
  const walk = (folder, prefix = '') => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true }).slice(0, 100)) {
      const rel = path.join(prefix, entry.name)
      if (entry.isDirectory()) { if (prefix.split(path.sep).length < 4) walk(path.join(folder, entry.name), rel) }
      else {
        const stat = fs.statSync(path.join(folder, entry.name))
        result.push({ path: rel.replace(/\\/g, '/'), bytes: stat.size, updatedAt: stat.mtime.toISOString() })
      }
      if (result.length >= 120) return
    }
  }
  walk(root)
  return result
}

function readWorkspace(userId, file) {
  const target = workspacePath(userId, file)
  const stat = fs.statSync(target)
  if (!stat.isFile() || stat.size > MAX_WORKSPACE_FILE) throw new Error('File workspace tidak tersedia atau terlalu besar.')
  return fs.readFileSync(target, 'utf8')
}

function writeWorkspace(userId, file, content) {
  const target = workspacePath(userId, file)
  const value = String(content ?? '')
  if (Buffer.byteLength(value) > MAX_WORKSPACE_FILE) throw new Error('Isi file workspace terlalu besar.')
  fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 })
  fs.writeFileSync(target, value, { mode: 0o600 })
  return { path: path.relative(workspaceFor(userId), target).replace(/\\/g, '/'), bytes: Buffer.byteLength(value) }
}

const BLOCKED_SHELL = [
  /(^|[;&|]\s*)rm\s+-[^\n]*(?:r|R)[^\n]*(?:f|F)/i, /\bmkfs\b/i, /\b(?:shutdown|reboot|poweroff|halt)\b/i,
  /\bkill\s+-9\s+1\b/i, /:\s*\(\s*\)\s*\{/i, /\bdd\s+if=/i, /\b(?:iptables|ufw)\b/i,
  /\b(?:curl|wget)\b[^\n]*\|\s*(?:ba)?sh/i, /\b(?:printenv|env)\b/i,
  /(?:^|\s)(?:cat|less|more|tail|head)\s+[^\n]*(?:\.env|creds\.json|session|token|secret|credential)/i,
  /\b(?:npm\s+token|git\s+config\s+--global|chmod\s+-R|chown\s+-R)\b/i,
  /(?:^|[;&|]\s*)\.\s+[^\n]+/i, /\bsource\s+/i, /\b(?:sudo|su|ssh|scp|sftp|rsync)\b/i,
  /\b(?:node|python(?:3)?|perl|ruby|php)\s+(?:-e|--eval|-c)\b/i, /\b(?:process\.env|Deno\.env|import\.meta\.env)\b/i,
  /\b(?:npm|pnpm|yarn|bun)\s+(?:install|i|add|update|upgrade|remove|uninstall|publish|login|logout|config)\b/i,
  /\b(?:curl|wget)\b/i, /\b(?:git\s+(?:push|fetch|pull|clone|remote|credential))\b/i,
  /(?:^|[^<])>{1,2}/, /(?:\$\{|\$\(|`|\$[A-Za-z_])/,
  /(?:^|[\s\/])(?:\.env(?:\.[A-Za-z0-9_-]+)?|\.owner-console-relay\.env|creds\.json|config(?:\.js|\.json)?|(?:session|sessions)(?:\/|\b)|(?:token|secret|credential|password|pterodactyl)[^\/\s]*)/i,
]

function validateOwnerShell(command) {
  const value = safeText(command, 2000)
  if (!value) throw new Error('Command shell kosong.')
  if (BLOCKED_SHELL.some(rule => rule.test(value))) throw new Error('Command diblokir oleh policy keamanan agent.')
  return value
}

async function runOwnerShell(command) {
  const checked = validateOwnerShell(command)
  const result = await execFileAsync('/bin/bash', ['-lc', checked], {
    cwd: ROOT,
    timeout: 90_000,
    maxBuffer: MAX_COMMAND_OUTPUT * 2,
    env: { PATH: process.env.PATH || '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', HOME: process.env.HOME || ROOT, LANG: 'C.UTF-8' },
  }).catch(error => ({ stdout: error.stdout || '', stderr: error.stderr || error.message || '', code: error.code || 1 }))
  const output = redact(`${result.stdout || ''}${result.stderr ? `\n${result.stderr}` : ''}`).slice(-MAX_COMMAND_OUTPUT)
  audit('agent.owner_shell', { command: checked, result: result.code || 0 })
  return { output: output || '(tidak ada output)', code: Number(result.code) || 0 }
}

async function runWorkspaceCommand(userId, command) {
  const value = safeText(command, 500)
  if (!/^(?:node\s+--check\s+[A-Za-z0-9._/-]+|npm\s+(?:test|run\s+[A-Za-z0-9:_-]+))$/.test(value)) {
    throw new Error('Workspace publik hanya mengizinkan node --check atau npm test/script.')
  }
  const result = await execFileAsync('/bin/bash', ['-lc', value], { cwd: workspaceFor(userId), timeout: 60_000, maxBuffer: MAX_COMMAND_OUTPUT })
    .catch(error => ({ stdout: error.stdout || '', stderr: error.stderr || error.message || '', code: error.code || 1 }))
  return { output: redact(`${result.stdout || ''}${result.stderr ? `\n${result.stderr}` : ''}`).slice(-MAX_COMMAND_OUTPUT) || '(tidak ada output)', code: Number(result.code) || 0 }
}

function healthSnapshot() {
  return {
    time: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
    mainBotConnected: global.stopped === 'open',
    pluginsLoaded: Object.values(global.plugins || {}).filter(p => typeof p === 'function' && !p.disabled).length,
    importedPluginsLoaded: Object.values(global.plugins || {}).filter(p => typeof p === 'function' && !p.disabled && p.importSource).length,
    jadibotConnected: global.jadibotConns instanceof Map ? [...global.jadibotConns.values()].filter(conn => conn?.__jadibotConnected).length : 0,
  }
}

async function callAgentModel(messages, tools, timeoutMs = 20000) {
  const settings = readSettings()
  if (!settings.apiKey) throw Object.assign(new Error('AI belum dikonfigurasi oleh owner.'), { status: 503 })
  if (settings.provider === 'groq') return chatGroq(messages, { apiKey:settings.apiKey, model:settings.model, tools, timeoutMs, maxTokens:2000 })
  if (settings.provider === 'gemini') return chatGemini(messages, { apiKey:settings.apiKey, model:settings.model, tools, timeoutMs, maxTokens:2000 })
  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${settings.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://website-jadibot-by-alzriss.vercel.app',
      'X-Title': 'Usanagi Umi Agent',
    },
    body: JSON.stringify({ model: settings.model || DEFAULT_MODEL, messages, max_tokens: 1400, temperature: 0.35, ...(tools?.length ? { tools, tool_choice: 'auto' } : {}) }),
    signal: AbortSignal.timeout(Math.min(20000, timeoutMs)),
  })
  const raw = await response.text()
  let data
  try { data = JSON.parse(raw) } catch { data = {} }
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || 'OpenRouter tidak dapat merespons.'), { status: response.status >= 500 ? 502 : response.status })
  const message = data?.choices?.[0]?.message
  if (!message) throw new Error('OpenRouter tidak mengembalikan jawaban agent.')
  return message
}

const WORKSPACE_TOOLS = [
  { type: 'function', function: { name: 'list_workspace', description: 'List files in the current users isolated workspace.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'read_workspace_file', description: 'Read a UTF-8 text file from the current users isolated workspace.', parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } } },
  { type: 'function', function: { name: 'write_workspace_file', description: 'Write a UTF-8 text file into the current users isolated workspace.', parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } } },
]

const OWNER_TOOLS = [
  { type: 'function', function: { name: 'get_bot_health', description: 'Check current main bot and Jadibot health.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'list_workspace', description: 'List files in the owner workspace.', parameters: { type: 'object', properties: {} } } },
  { type: 'function', function: { name: 'read_workspace_file', description: 'Read a text file from the owner workspace.', parameters: { type: 'object', properties: { path: { type: 'string' } }, required: ['path'] } } },
  { type: 'function', function: { name: 'write_workspace_file', description: 'Write a text file into the owner workspace.', parameters: { type: 'object', properties: { path: { type: 'string' }, content: { type: 'string' } }, required: ['path', 'content'] } } },
  { type: 'function', function: { name: 'run_owner_shell', description: 'Run a non-destructive server command in the bot container. Never use this to access secrets, credentials, sessions, env files, destructive commands, or install software.', parameters: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] } } },
]

async function executeTool(call, userId, owner) {
  const args = (() => { try { return JSON.parse(call.function?.arguments || '{}') } catch { return {} } })()
  const name = call.function?.name
  // Defense in depth: the public model request receives only workspace tools,
  // and this server-side allowlist still rejects any fabricated privileged call.
  if (!owner && !['list_workspace', 'read_workspace_file', 'write_workspace_file'].includes(name)) return { error: 'Tool tidak tersedia untuk workspace publik.' }
  try {
    switch (name) {
      case 'get_bot_health': return healthSnapshot()
      case 'list_workspace': return listWorkspace(userId)
      case 'read_workspace_file': return { content: readWorkspace(userId, args.path) }
      case 'write_workspace_file': return writeWorkspace(userId, args.path, args.content)
      case 'run_owner_shell': return await runOwnerShell(args.command)
      default: return { error: 'Tool tidak tersedia.' }
    }
  } catch (error) {
    return { error: safeText(error.message, 500) }
  }
}

function historyFile(userId) {
  return path.join(workspaceFor(userId), '.agent-history.json')
}
function loadHistory(userId) {
  try { const data = JSON.parse(fs.readFileSync(historyFile(userId), 'utf8')); return Array.isArray(data) ? data.slice(-MAX_HISTORY) : [] } catch { return [] }
}
function saveHistory(userId, history) {
  try { fs.writeFileSync(historyFile(userId), JSON.stringify(history.slice(-MAX_HISTORY)), { mode: 0o600 }) } catch {}
}

export async function agentChat({ userId, prompt, owner = false }) {
  const input = safeText(prompt, MAX_PROMPT)
  if (!input) throw Object.assign(new Error('Pesan agent kosong.'), { status: 400 })
  const system = owner
    ? 'You are Usanagi Umi Owner Agent. You help monitor, develop, and operate the bot 24/7. You may use tools automatically only when needed. Never request, reveal, or access credentials, sessions, pairing codes, phone numbers, environment files, or private keys. Keep actions reversible and explain completed work concisely in Indonesian.'
    : 'You are Usanagi Umi AI support agent. Help users with the Jadibot website and bot. You can manage only the current users private workspace; never server-shell or credentials access. Never access another users data. Be concise, safe, and respond in Indonesian.'
  const messages = [{ role: 'system', content: system }, ...loadHistory(userId), { role: 'user', content: input }]
  const tools = owner ? OWNER_TOOLS : WORKSPACE_TOOLS
  const deadline = Date.now() + 35000
  for (let round = 0; round <= MAX_TOOL_CALLS; round++) {
    if (Date.now() >= deadline) throw Object.assign(new Error('AI melewati batas waktu. Coba permintaan lebih singkat.'), { status:504 })
    const message = await callAgentModel(messages, tools, Math.min(20000,deadline-Date.now()))
    messages.push(message)
    const calls = Array.isArray(message.tool_calls) ? message.tool_calls : []
    if (!calls.length) {
      const answer = safeText(message.content || 'Agent selesai tanpa jawaban teks.', 12000)
      const stored = [...loadHistory(userId), { role: 'user', content: input }, { role: 'assistant', content: answer }]
      saveHistory(userId, stored)
      audit('agent.chat', { actor: userId, owner, prompt: input.slice(0, 240) })
      return { answer, health: owner ? healthSnapshot() : undefined }
    }
    for (const call of calls) {
      const result = await executeTool(call, userId, owner)
      messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result).slice(0, MAX_COMMAND_OUTPUT) })
    }
  }
  throw new Error('Agent menghentikan rangkaian tool yang terlalu panjang.')
}

/* Tes koneksi ringan untuk halaman AI Owner: satu permintaan kecil ke
 * provider aktif. Dipakai tombol "TES KONEKSI AI" supaya owner tahu apakah
 * key/model benar-benar hidup (bukan hanya "tersimpan"). */
export async function agentTest(actor) {
  const settings = readSettings()
  if (!settings.apiKey) throw Object.assign(new Error('AI belum dikonfigurasi oleh owner.'), { status: 503 })
  const started = Date.now()
  const message = await callAgentModel([
    { role: 'system', content: 'Balas satu kata saja: SIAP' },
    { role: 'user', content: 'ping' },
  ], [], 20000)
  const reply = safeText(message?.content || '', 200)
  audit('agent.test', { actor, provider: settings.provider, model: settings.model, ms: Date.now() - started })
  return { ok: true, provider: settings.provider, model: settings.model, reply, ms: Date.now() - started }
}

/**
 * Mask satu key provider yang tersimpan terenkripsi. Dipakai halaman Setting
 * Bot Utama supaya OpenRouter bisa ditampilkan sebagai `AQ…1234` tanpa pernah
 * mengirim key utuh ke browser.
 */
export function agentProviderKeyMask(provider = 'openrouter') {
  const name = ['gemini', 'groq', 'openrouter'].includes(String(provider)) ? String(provider) : ''
  if (!name) return ''
  try {
    const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'))
    const key = decryptSecret(data ? data[name] : null)
    if (!key || key.length < 12) return ''
    return `${key.slice(0, 6)}…${key.slice(-4)}`
  } catch { return '' }
}

export function agentStatus() {
  const settings = readSettings()
  return { configured: Boolean(settings.apiKey), provider:settings.provider, model: settings.model || (settings.provider==='groq'?DEFAULT_GROQ_MODEL:settings.provider==='gemini'?DEFAULT_GEMINI_MODEL:DEFAULT_MODEL), updatedAt: settings.updatedAt || null, workerActive: Boolean(workerTimer), health: healthSnapshot() }
}

export function updateAgentSettings(input, actor) {
  return writeSettings({ apiKey: input?.apiKey || input?.groqApiKey || input?.openrouterApiKey, provider:input?.provider || (input?.groqApiKey?'groq':input?.openrouterApiKey?'openrouter':undefined), model: input?.model, updatedBy: actor })
}

export async function ownerAgentShell(command, actor) {
  const result = await runOwnerShell(command)
  audit('agent.owner_shell.request', { actor, command })
  return result
}

function maintenanceTick() {
  try {
    ensureDirs()
    fs.writeFileSync(STATUS_FILE, `${JSON.stringify(healthSnapshot())}\n`, { mode: 0o600 })
    const cutoff = Date.now() - WORKSPACE_TTL_MS
    for (const entry of fs.readdirSync(WORKSPACE_ROOT, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const full = path.join(WORKSPACE_ROOT, entry.name)
      if (fs.statSync(full).mtimeMs < cutoff) fs.rmSync(full, { recursive: true, force: true })
    }
  } catch {}
}

export function startUmiAgentWorker(secretProvider) {
  runtimeSecretProvider = secretProvider
  if (workerTimer) return
  maintenanceTick()
  workerTimer = setInterval(maintenanceTick, 60_000)
  workerTimer.unref?.()
}

export default { agentChat, agentStatus, agentTest, updateAgentSettings, ownerAgentShell, startUmiAgentWorker, agentProviderKeyMask }
