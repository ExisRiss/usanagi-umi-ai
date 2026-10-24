/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs-extra'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { downloadMediaMessage } from '@rexxhayanasi/elaina-baileys'

const execFileAsync = promisify(execFile)

const MAX_FILE_SIZE = 2 * 1024 * 1024
const MAX_OUTPUT_SIZE = 15 * 1024 * 1024
const TIMEOUT_MS = 60_000
const PROGRESS_INTERVAL_MS = 850
const MIN_PROGRESS_DURATION_MS = 5_500
const STAGE_MIN_HOLD_MS = 550
const SUPPORTED_TYPES = new Set(['.js', '.mjs', '.cjs', '.html', '.htm', '.css', '.json'])

const SPINNER = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
const BAR_FULL = '━'
const BAR_EMPTY = '·'
const BAR_SIZE = 12

const JS_RESERVED_NAMES = [
  '^handler$', '^m$', '^conn$', '^raw$', '^chat$', '^quotedMsg$', '^quotedMessage$',
  '^docInfo$', '^fileName$', '^fileBuffer$', '^processFile$', '^module$', '^exports$', '^require$',
]

const UNICODE_IDENTIFIER_ALPHABET = [
  '名', '文', '字', '函', '值', '集', '索', '映', '模', '変', '数', '項',
  '中', '華', '龍', '星', '空', '月', '雪', '影', '極', '幻', '零', '玄',
  'م', 'س', 'ص', 'ق', 'ض', 'ح', 'ع', 'ك', 'ن', 'و', 'ر', 'ت', 'ف', 'ب',
  'Ж', 'Ф', 'Л', 'Я', 'Б', 'Д', 'Ш', 'Ц',
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז',
  'λ', 'Δ', 'Ω', 'Σ', 'π', 'θ', 'ξ', 'φ',
  'न', 'म', 'क', 'व', 'र', 'त', 'स', 'प',
]

function buildUnicodeIdentifierDictionary(source, minimum = 512) {
  const estimated = Math.max(
    minimum,
    Math.min(50_000, (source.match(/[$_\p{L}\p{M}][$_\p{L}\p{M}\p{N}]*/gu) || []).length * 8)
  )

  const result = []
  const used = new Set()
  const alphabet = UNICODE_IDENTIFIER_ALPHABET
  let counter = 0

  while (result.length < estimated) {
    let n = counter++
    let body = ''
    do {
      body = alphabet[n % alphabet.length] + body
      n = Math.floor(n / alphabet.length) - 1
    } while (n >= 0)

    const name = `_${body}`
    if (!used.has(name)) {
      used.add(name)
      result.push(name)
    }
  }

  return result
}

const SECURITY_RULES = [
  { id: 'fs-delete', severity: 'critical', score: 10, label: 'destruksi filesystem', pattern: /(?:fs|node:fs|require\s*\(\s*['"](?:fs|node:fs)['"]\s*\))\s*\.\s*(?:rm|rmSync|rmdir|rmdirSync|unlink|unlinkSync|truncate|truncateSync)\s*\(/i },
  { id: 'system-path-delete', severity: 'critical', score: 10, label: 'destruksi path sistem', pattern: /(?:rm\s+-rf\s+\/|del\s+\/[sq].*\\|format\s+[a-z]:|Remove-Item\s+.*(?:C:\\Windows|C:\\System32|\/etc|\/boot|\/sys))/i },
  { id: 'credential-file-read', severity: 'high', score: 8, label: 'akses file kredensial', pattern: /(?:readFile|readFileSync|createReadStream)\s*\([\s\S]{0,240}(?:\/etc\/passwd|\/etc\/shadow|id_rsa|authorized_keys|\.ssh|\.aws\/credentials|\.npmrc|\.env|\.pem|\.key)/i },
  { id: 'credential-exfil', severity: 'critical', score: 10, label: 'indikasi exfiltrasi kredensial', pattern: /(?:document\.cookie|localStorage|sessionStorage|process\.env|authorization|access[_-]?token|refresh[_-]?token)[\s\S]{0,260}(?:fetch|XMLHttpRequest|axios|https?\.request|WebSocket|send\s*\()/i },
  { id: 'shell-destructive', severity: 'critical', score: 10, label: 'shell command destruktif', pattern: /(?:spawn|spawnSync|exec|execSync|execFile|execFileSync)\s*\([\s\S]{0,240}(?:rm\s+-rf|del\s+\/s|format\s+[a-z]:|shutdown|reboot|mkfs|diskpart)/i },
  { id: 'fork-flood', severity: 'critical', score: 10, label: 'indikasi process flood', pattern: /(?:while|for)\s*\([\s\S]{0,160}\)\s*\{[\s\S]{0,600}(?:fork\s*\(|spawn(?:Sync)?\s*\(|exec(?:Sync)?\s*\()/i },
  { id: 'ransomware', severity: 'critical', score: 10, label: 'indikasi enkripsi file massal', pattern: /(?:readdir|readdirSync|glob|fastGlob)[\s\S]{0,500}(?:encrypt|createCipheriv|chacha20|aes-[0-9]+|lockFiles|encryptFiles)[\s\S]{0,500}(?:writeFile|writeFileSync|rename|unlink)/i },
  { id: 'persistence', severity: 'high', score: 8, label: 'mekanisme persistence/autorun', pattern: /(?:HKLM|HKCU|CurrentVersion\\Run|LaunchAgents|systemctl\s+enable|\/etc\/init\.d|cron\.d|crontab|schtasks|startup)/i },
  { id: 'powershell-encoded', severity: 'high', score: 8, label: 'PowerShell encoded payload', pattern: /(?:powershell|pwsh)[\s\S]{0,120}(?:-enc|-encodedcommand)/i },
  { id: 'download-execute', severity: 'high', score: 8, label: 'download lalu eksekusi payload', pattern: /(?:fetch|https?\.get|axios\.(?:get|request)|curl|wget)[\s\S]{0,500}(?:eval|Function\s*\(|vm\.run|exec\s*\(|spawn\s*\()/i },
  { id: 'dynamic-exec', severity: 'medium', score: 3, label: 'dynamic code execution', pattern: /(?:eval\s*\(|new\s+Function\s*\(|vm\.(?:runInNewContext|runInThisContext|Script)\s*\()/i },
  { id: 'child-process', severity: 'medium', score: 2, label: 'akses child_process', pattern: /(?:node:child_process|child_process|spawn(?:Sync)?|exec(?:Sync)?|execFile(?:Sync)?)/i },
  { id: 'native-binding', severity: 'medium', score: 3, label: 'native/internal binding', pattern: /process\.binding\s*\(|process\.dlopen\s*\(|(?:node:ffi|ffi-napi|ref-napi)/i },
  { id: 'packed-payload', severity: 'medium', score: 2, label: 'packed/base64 payload', pattern: /(?:Buffer\.from\s*\([\s\S]{0,300}['"]base64['"]|atob\s*\(|fromCharCode\s*\()[\s\S]{0,1200}(?:eval|Function|vm\.)/i },
  { id: 'network-loop', severity: 'medium', score: 2, label: 'network call berulang', pattern: /(?:setInterval|setTimeout)\s*\([\s\S]{0,220}(?:fetch|axios|https?\.request|WebSocket)\s*\(/i },
  { id: 'module-loader', severity: 'medium', score: 3, label: 'dynamic module loading', pattern: /(?:process\.mainModule\.require|module\._load|require\.resolve|createRequire\s*\()\s*[\s\S]{0,120}(?:eval|Function|vm\.)?/i },
  { id: 'native-addon', severity: 'high', score: 7, label: 'native addon loading', pattern: /(?:process\.dlopen|node-gyp|\.node[\s'\")]|bindings\s*\()/i },
  { id: 'obfuscated-exec', severity: 'high', score: 7, label: 'encoded payload menuju eksekusi', pattern: /(?:Buffer\.from\s*\([^)]{40,}['\"]base64['\"]|atob\s*\(|decodeURIComponent\s*\()\s*[\s\S]{0,1800}(?:eval|new\s+Function|vm\.|exec(?:Sync)?\s*\()/i },
  { id: 'env-bulk-read', severity: 'medium', score: 3, label: 'pembacaan environment massal', pattern: /Object\.(?:keys|entries|values)\s*\(\s*process\.env|JSON\.stringify\s*\(\s*process\.env/i },
  { id: 'crypto-lock-loop', severity: 'high', score: 7, label: 'pola crypto + filesystem berulang', pattern: /(?:createCipheriv|createDecipheriv|crypto\.subtle)[\s\S]{0,700}(?:readdir|glob|writeFile|rename|unlink)/i },
]

function randHex(bytes = 8) {
  return crypto.randomBytes(bytes).toString('hex')
}

function tempPath(ext = 'tmp') {
  return path.join(os.tmpdir(), `usanagi-enc-${Date.now()}-${randHex(6)}.${ext}`)
}

function formatBytes(value) {
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`
  return `${(value / 1024 / 1024).toFixed(2)} MB`
}

function progressBar(percent) {
  const filled = Math.round((Math.max(0, Math.min(100, percent)) / 100) * BAR_SIZE)
  return BAR_FULL.repeat(filled) + BAR_EMPTY.repeat(BAR_SIZE - filled)
}

function compactName(name, max = 30) {
  if (name.length <= max) return name
  return `${name.slice(0, max - 3)}...`
}

function progressText(fileName, percent, phase, detail, frameIndex, stats = '') {
  const safe = Math.max(0, Math.min(100, Math.round(percent)))
  const spinner = SPINNER[frameIndex % SPINNER.length]
  return (
    `╭─「 *USANAGI ENCODE* 」\n` +
    `│ 📄 *File*  : ${compactName(fileName)}\n` +
    `│ ⚙️ *Mode*  : HARD AST • SAFE\n` +
    `│ ${spinner} *Stage* : ${phase}\n` +
    `│\n` +
    `│ ${progressBar(safe)} *${safe}%*\n` +
    `│\n` +
    `│ ${detail}\n` +
    (stats ? `│ ${stats}\n` : '') +
    `╰──────────────`
  )
}

function resultText(fileName, percent, title, phase, detail, stats = '') {
  return (
    `╭─「 *${title}* 」\n` +
    `│ 📄 *File*  : ${compactName(fileName)}\n` +
    `│ ⚙️ *Mode*  : HARD AST • SAFE\n` +
    `│ *Status*  : ${percent}% • ${phase}\n` +
    `│\n` +
    `│ ${detail}\n` +
    (stats ? `│ ${stats}\n` : '') +
    `╰──────────────`
  )
}

function normalizeError(message) {
  const text = String(message || 'Terjadi kesalahan.')
  if (/empty media key|media key/i.test(text)) {
    return 'Media key WhatsApp tidak tersedia. Kirim ulang file sebagai Dokumen lalu reply dengan .enc.'
  }
  if (/timed out|timeout|batas waktu/i.test(text)) {
    return 'Proses melewati batas waktu 60 detik. Coba file yang lebih kecil.'
  }
  return text.replace(/\s+/g, ' ').slice(0, 220)
}

async function createProgress(conn, chat, raw, fileName) {
  let current = 0
  let target = 0
  let phase = 'Menyiapkan'
  let detail = 'Menyiapkan engine encode.'
  let stats = ''
  let frameIndex = 0
  let stopped = false
  let editing = false
  const startedAt = Date.now()

  const sent = await conn.sendMessage(
    chat,
    { text: progressText(fileName, 0, phase, detail, frameIndex) },
    { quoted: raw }
  )

  const timer = setInterval(async () => {
    if (stopped || editing || !sent?.key) return
    editing = true
    try {
      if (current < target) {
        current += Math.max(1, Math.ceil((target - current) / 2))
        if (current > target) current = target
      } else {
        frameIndex++
      }
      await conn.sendMessage(
        chat,
        { text: progressText(fileName, current, phase, detail, frameIndex, stats), edit: sent.key }
      )
    } catch {}
    finally {
      editing = false
    }
  }, PROGRESS_INTERVAL_MS)

  return {
    set(percent, nextPhase, nextDetail, nextStats = '') {
      target = Math.max(target, Math.min(100, percent))
      phase = nextPhase
      detail = nextDetail
      stats = nextStats
      frameIndex++
    },
    async finish(finalDetail, finalStats = '') {
      const remaining = MIN_PROGRESS_DURATION_MS - (Date.now() - startedAt)
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining))
      stopped = true
      clearInterval(timer)
      current = 100
      target = 100
      phase = 'Selesai'
      detail = finalDetail
      stats = finalStats
      await conn.sendMessage(
        chat,
        { text: progressText(fileName, 100, phase, detail, frameIndex + 1, stats), edit: sent.key }
      ).catch(() => {})
    },
    async fail(errorDetail) {
      stopped = true
      clearInterval(timer)
      await conn.sendMessage(
        chat,
        { text: resultText(fileName, Math.max(current, target), 'ENCODE GAGAL', 'Dihentikan', errorDetail) , edit: sent.key }
      ).catch(() => {})
    },
    async hold(ms = STAGE_MIN_HOLD_MS) {
      await new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)))
    },
    async stop() {
      stopped = true
      clearInterval(timer)
    },
  }
}

function stripJsCommentsForScan(src) {
  let out = ''
  let i = 0
  let state = 'code'

  while (i < src.length) {
    const c = src[i]
    const n = src[i + 1]

    if (state === 'code') {
      if (c === '/' && n === '/') {
        state = 'line'
        out += ' '
        i += 2
        continue
      }
      if (c === '/' && n === '*') {
        state = 'block'
        out += ' '
        i += 2
        continue
      }
      if (c === '"' || c === "'" || c === '`') {
        state = c
        out += c
        i++
        continue
      }
      out += c
      i++
      continue
    }

    if (state === 'line') {
      if (c === '\n') {
        state = 'code'
        out += '\n'
      }
      i++
      continue
    }

    if (state === 'block') {
      if (c === '*' && n === '/') {
        state = 'code'
        out += ' '
        i += 2
      } else {
        out += c === '\n' ? '\n' : ' '
        i++
      }
      continue
    }

    out += c
    if (c === '\\') {
      out += src[i + 1] || ''
      i += 2
      continue
    }
    if (c === state) state = 'code'
    i++
  }

  return out
}

function sha256(source) {
  return crypto.createHash('sha256').update(source, 'utf8').digest('hex')
}

function estimateEntropy(source) {
  if (!source.length) return 0
  const counts = new Map()
  for (let i = 0; i < source.length; i++) counts.set(source.charCodeAt(i), (counts.get(source.charCodeAt(i)) || 0) + 1)
  let entropy = 0
  for (const count of counts.values()) {
    const p = count / source.length
    entropy -= p * Math.log2(p)
  }
  return entropy
}

function extractPackedPayloads(src) {
  const payloads = []
  const base64Re = /['\"]([A-Za-z0-9+/=_-]{80,})['\"]/g
  let match
  let count = 0
  while ((match = base64Re.exec(src)) && count < 20) {
    try {
      const clean = match[1].replace(/-/g, '+').replace(/_/g, '/')
      const decoded = Buffer.from(clean, 'base64').toString('utf8')
      if (decoded && /[\x20-\x7E\n\r\t]/.test(decoded)) payloads.push(decoded)
    } catch {}
    count++
  }
  return payloads
}

function analyzeSourceDeep(src, ext) {
  if (src.includes('\u0000')) throw new Error('Source mengandung NUL byte yang tidak normal untuk file teks.')
  const lines = src.split(/\r?\n/).length
  const nonWhitespace = src.replace(/\s/g, '')
  const printable = [...src].filter((c) => c === '\n' || c === '\r' || c === '\t' || (c >= ' ' && c <= '~') || c.charCodeAt(0) > 127).length
  const printableRatio = printable / Math.max(1, src.length)
  const entropy = estimateEntropy(nonWhitespace.slice(0, 250_000))
  if (printableRatio < 0.70) throw new Error(`Konten tampak bukan source teks biasa (${(printableRatio * 100).toFixed(0)}% printable).`)
  return {
    ext,
    bytes: Buffer.byteLength(src, 'utf8'),
    lines,
    sha256: sha256(src),
    entropy: Number(entropy.toFixed(2)),
    packedPayloads: extractPackedPayloads(src),
  }
}

function collectSecurityFindings(src, deep = null) {
  const candidates = [src, stripJsCommentsForScan(src), ...(deep?.packedPayloads || [])]
  const findings = new Map()

  for (const rule of SECURITY_RULES) {
    for (const candidate of candidates) {
      if (rule.pattern.test(candidate)) {
        findings.set(rule.id, rule)
        break
      }
    }
  }

  let score = 0
  for (const finding of findings.values()) score += finding.score

  const critical = [...findings.values()].filter((item) => item.severity === 'critical')
  const high = [...findings.values()].filter((item) => item.severity === 'high')
  const medium = [...findings.values()].filter((item) => item.severity === 'medium')

  return { score, critical, high, medium, total: findings.size }
}

function securityDecision(report) {
  if (report.critical.length) {
    return { action: 'reject', level: 'CRITICAL', reason: report.critical[0].label }
  }
  if (report.high.length >= 2 || report.score >= 12) {
    return { action: 'reject', level: 'HIGH', reason: report.high[0]?.label || 'kombinasi pola berisiko tinggi' }
  }
  if (report.high.length === 1) {
    return { action: 'review', level: 'REVIEW', reason: report.high[0].label }
  }
  return {
    action: 'allow',
    level: report.medium.length ? 'MONITOR' : 'CLEAN',
    reason: report.medium.length ? 'terdapat pola sensitif yang masih diizinkan' : 'tidak ada pola risiko tinggi',
  }
}

async function loadObfuscator() {
  let mod
  try {
    mod = await import('javascript-obfuscator')
  } catch {
    throw new Error('Dependency javascript-obfuscator belum terpasang. Jalankan npm install lalu coba lagi.')
  }
  const api = mod.default || mod
  const obfuscate = api.obfuscate || mod.obfuscate
  if (typeof obfuscate !== 'function') throw new Error('Engine obfuscator tidak menyediakan API yang valid.')
  return obfuscate
}

function buildObfuscatorOptions(source, dictionarySize = null) {
  return {
    compact: true,
    simplify: true,
    target: 'node',
    log: false,
    seed: 0,
    identifierNamesGenerator: 'dictionary',
    identifiersDictionary: buildUnicodeIdentifierDictionary(source, dictionarySize || 512),
    renameGlobals: false,
    renameProperties: false,
    transformObjectKeys: false,
    ignoreImports: true,
    reservedNames: JS_RESERVED_NAMES,
    sourceMap: false,
    selfDefending: false,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: false,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.82,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.16,
    numbersToExpressions: true,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayCallsTransformThreshold: 0.95,
    stringArrayEncoding: ['rc4', 'base64'],
    stringArrayIndexesType: ['hexadecimal-number'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 3,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 3,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.95,
    splitStrings: true,
    splitStringsChunkLength: 7,
    unicodeEscapeSequence: false,
  }
}

function obfuscateWithResilience(source, obfuscate) {
  const dictionarySizes = [512, 2048, 8192, 20_000, 50_000]
  let lastError = null

  for (const size of dictionarySizes) {
    try {
      return obfuscate(source, buildObfuscatorOptions(source, size)).getObfuscatedCode()
    } catch (err) {
      lastError = err
      const message = String(err?.message || err || '')
      if (!/identifiers|dictionary|identifier names|too many/i.test(message)) throw err
    }
  }

  try {
    const fallback = buildObfuscatorOptions(source, 512)
    fallback.identifierNamesGenerator = 'hexadecimal'
    fallback.identifiersDictionary = []
    return obfuscate(source, fallback).getObfuscatedCode()
  } catch (fallbackError) {
    throw new Error(lastError?.message || fallbackError?.message || 'Engine obfuscator gagal membuat output.')
  }
}

async function validateNodeSource(src, ext) {
  const temp = tempPath(ext.slice(1))
  try {
    await fs.writeFile(temp, src, 'utf8')
    await execFileAsync(process.execPath, ['--check', temp], {
      timeout: 15_000,
      maxBuffer: 1024 * 1024,
      windowsHide: true,
    })
    return true
  } catch {
    return false
  } finally {
    await fs.remove(temp).catch(() => {})
  }
}

function validateJsonSource(src) {
  try {
    JSON.parse(src)
    return true
  } catch {
    return false
  }
}

function stripCssComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, '')
}

function minifyCssSafe(src) {
  return stripCssComments(src)
    .replace(/[\t\r\n]+/g, ' ')
    .replace(/\s*([{}:;,>+~])\s*/g, '$1')
    .replace(/;}/g, '}')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function escapeJsonEveryString(value) {
  let out = '"'
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i)
    out += `\\u${code.toString(16).padStart(4, '0')}`
  }
  return `${out}"`
}

function stringifyJsonHard(value) {
  if (typeof value === 'string') return escapeJsonEveryString(value)
  if (value === null) return 'null'
  if (typeof value === 'number' || typeof value === 'boolean') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stringifyJsonHard).join(',')}]`
  if (typeof value === 'object') {
    return `{${Object.keys(value).map((key) => `${escapeJsonEveryString(key)}:${stringifyJsonHard(value[key])}`).join(',')}}`
  }
  throw new Error('Tipe JSON tidak didukung.')
}

function obfuscateHtml(src, obfuscateJs) {
  let result = src

  result = result.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (full, attrs, code) => {
    if (!code.trim()) return full
    const typeMatch = attrs.match(/\btype\s*=\s*["']([^"']+)["']/i)
    const type = typeMatch?.[1]?.toLowerCase()
    if (type && !type.includes('javascript') && type !== 'module' && type !== 'text/ecmascript') return full
    try {
      return `<script${attrs}>${obfuscateJs(code)}</script>`
    } catch {
      return full
    }
  })

  return result
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
}

function getDocumentInfo(messageLike) {
  if (!messageLike) return null
  const container = messageLike?.message || messageLike
  const doc = container?.documentMessage || container?.documentWithCaptionMessage?.message?.documentMessage
  if (!doc) return null
  return {
    fileName: doc.fileName || 'file.js',
    mimeType: doc.mimetype || 'application/octet-stream',
    fileSize: Number(doc.fileLength || 0),
  }
}

function inferExtension(fileName, mimeType) {
  const fromName = path.extname(fileName).toLowerCase()
  if (SUPPORTED_TYPES.has(fromName)) return fromName
  const mimeMap = {
    'application/javascript': '.js',
    'text/javascript': '.js',
    'application/x-javascript': '.js',
    'application/json': '.json',
    'text/json': '.json',
    'text/html': '.html',
    'application/xhtml+xml': '.html',
    'text/css': '.css',
  }
  return mimeMap[mimeType] || null
}

function makeOutputName(fileName, ext) {
  const originalExt = path.extname(fileName)
  const base = path.basename(fileName, originalExt)
  return `${base}_enc${ext}`
}

function buildFallbackQuotedMessage(raw, quotedContent, chat) {
  const contextInfo = raw?.message?.extendedTextMessage?.contextInfo || null
  if (!quotedContent || !contextInfo?.stanzaId) return null
  return {
    key: {
      remoteJid: chat,
      fromMe: false,
      id: contextInfo.stanzaId,
      participant: contextInfo.participant || undefined,
    },
    message: quotedContent,
    pushName: raw?.pushName,
    messageTimestamp: raw?.messageTimestamp,
  }
}

async function downloadSource(quotedMessage) {
  if (!quotedMessage?.message) {
    throw new Error('Pesan Dokumen yang direply tidak lengkap.')
  }

  let buffer
  try {
    buffer = await downloadMediaMessage(
      quotedMessage,
      'buffer',
      {},
      { logger: { info: () => {}, debug: () => {}, error: () => {}, warn: () => {}, trace: () => {} } }
    )
  } catch (err) {
    throw new Error(normalizeError(err?.message || err))
  }

  if (!buffer?.length) throw new Error('File kosong atau media tidak dapat dibaca.')
  if (buffer.length > MAX_FILE_SIZE) throw new Error('File melewati batas input 2 MB.')
  return buffer
}

async function transformByType(src, ext, progress) {
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
    progress.set(58, 'AST Obfuscation', 'Transform scope, identifier, string, angka, control-flow, dead-code.')
    const obfuscate = await loadObfuscator()
    const result = obfuscateWithResilience(src, obfuscate)
    if (!result?.trim()) throw new Error('Engine menghasilkan output JavaScript kosong.')

    progress.set(78, 'Validasi JS', 'Memeriksa syntax output tanpa menjalankan source code.')
    if (!(await validateNodeSource(result, ext))) throw new Error('Output JavaScript gagal validasi parser Node.')
    return { result, outExt: ext }
  }

  if (ext === '.html' || ext === '.htm') {
    progress.set(56, 'HTML Hardening', 'Memproses JavaScript inline dan menjaga struktur markup.')
    const obfuscate = await loadObfuscator()
    const result = obfuscateHtml(src, (code) => obfuscateWithResilience(code, obfuscate))
    if (!/<[a-z][\s\S]*>/i.test(result)) throw new Error('Output HTML gagal validasi struktur.')
    progress.set(80, 'Validasi HTML', 'Struktur HTML selesai diperiksa.')
    return { result, outExt: ext }
  }

  if (ext === '.css') {
    progress.set(58, 'CSS Hardening', 'Membersihkan komentar dan whitespace tanpa mengganti selector/class/id.')
    const result = minifyCssSafe(src)
    if (!result.includes('{') || !result.includes('}')) throw new Error('Output CSS gagal validasi struktur.')
    progress.set(80, 'Validasi CSS', 'Struktur CSS tetap valid.')
    return { result, outExt: ext }
  }

  if (ext === '.json') {
    progress.set(58, 'JSON Hardening', 'Mempertahankan JSON valid sambil menyamarkan string dan key dengan Unicode escape.')
    let parsed
    try {
      parsed = JSON.parse(src)
    } catch {
      throw new Error('JSON tidak valid, proses dihentikan.')
    }
    const result = stringifyJsonHard(parsed)
    if (!validateJsonSource(result)) throw new Error('Output JSON gagal validasi parser.')
    progress.set(80, 'Validasi JSON', 'Tipe data JSON tetap dipertahankan.')
    return { result, outExt: ext }
  }

  throw new Error(`Tipe file ${ext} tidak didukung.`)
}

const handler = async (m, { conn, rawConn }) => {
  const processConn = rawConn || conn
  const chat = m.chat
  const raw = m.raw
  const quotedContent = m.quoted || null
  let quotedMessage = m.quotedMessage || null
  const currentMessage = m.currentMessage || raw?.message || null
  const currentContent = currentMessage?.documentMessage || currentMessage?.documentWithCaptionMessage?.message?.documentMessage ? currentMessage : null
  const commandFromDocumentCaption = Boolean(currentContent?.documentMessage?.caption === '.enc' || currentContent?.documentWithCaptionMessage?.message?.documentMessage?.caption === '.enc')

  if (!quotedMessage) {
    quotedMessage = buildFallbackQuotedMessage(raw, quotedContent, chat)
  }

  const sourceMessage = quotedMessage || (commandFromDocumentCaption ? raw : null)
  const docInfo = getDocumentInfo(quotedContent || sourceMessage || currentContent)

  if (!docInfo || !sourceMessage) {
    await conn.sendMessage(
      chat,
      {
        text:
          `╭─「 *ENCODE SOURCE* 」\n` +
          `│\n` +
          `│ 📌 Reply Dokumen + *.enc*  ATAU  caption *.enc*\n` +
          `│\n` +
          `│ 📦 JS • MJS • CJS • HTML\n` +
          `│    HTM • CSS • JSON\n` +
          `│ 💾 Maks. input : *2 MB*\n` +
          `╰──────────────`,
      },
      { quoted: raw }
    )
    return
  }

  const fileName = docInfo.fileName
  const ext = inferExtension(fileName, docInfo.mimeType)

  if (!ext) {
    await conn.sendMessage(
      chat,
      {
        text:
          `╭─「 *FORMAT DITOLAK* 」\n` +
          `│ 📄 ${compactName(fileName)}\n` +
          `│\n` +
          `│ Gunakan: *.js .mjs .cjs*\n` +
          `│ *.html .htm .css .json*\n` +
          `╰──────────────`,
      },
      { quoted: raw }
    )
    return
  }

  if (docInfo.fileSize > MAX_FILE_SIZE) {
    await conn.sendMessage(
      chat,
      {
        text:
          `╭─「 *FILE TERLALU BESAR* 」\n` +
          `│ 📄 ${compactName(fileName)}\n` +
          `│ 💾 Ukuran : *${formatBytes(docInfo.fileSize)}*\n` +
          `│ ❌ Batas   : *2 MB*\n` +
          `╰──────────────`,
      },
      { quoted: raw }
    )
    return
  }

  let progress = null
  let tmpOutput = null
  let timedOut = false

  try {
    if (!sourceMessage) {
      throw new Error('Pesan sumber Dokumen tidak memiliki metadata media yang dapat dipakai untuk diunduh.')
    }

    progress = await createProgress(processConn, chat, raw, fileName)
    progress.set(10, 'Mengambil file', 'Mengambil Dokumen yang direply.')

    const timeout = new Promise((_, reject) => {
      const timer = setTimeout(() => {
        timedOut = true
        reject(new Error('Proses melewati batas waktu 60 detik.'))
      }, TIMEOUT_MS)
      timer.unref?.()
    })

    const processFile = async () => {
      const fileBuffer = await downloadSource(sourceMessage)
      if (timedOut) return

      progress.set(22, 'Integrity Check', 'Memeriksa ukuran dan encoding source.')
      const srcCode = fileBuffer.toString('utf8')
      if (srcCode.includes('\uFFFD') && srcCode.length > 100) {
        throw new Error('File bukan text UTF-8 yang valid.')
      }

      progress.set(30, 'Deep File Analysis', 'Menganalisis struktur, entropy, packed payload, hash, dan integritas source.')
      const deep = analyzeSourceDeep(srcCode, ext)
      await progress.hold()

      progress.set(40, 'Deep Security Scan', 'Memeriksa filesystem, shell, credential, persistence, native code, dan payload tersembunyi.')
      const report = collectSecurityFindings(srcCode, deep)
      const decision = securityDecision(report)

      if (decision.action === 'reject') {
        const detected = [...report.critical, ...report.high].slice(0, 3).map((x) => x.label).join(', ')
        throw new Error(`Security block: ${detected || decision.reason}`)
      }

      progress.set(46, decision.level === 'REVIEW' ? 'Security Review' : 'Security Passed', decision.reason, `Temuan : ${report.total} • Score : ${report.score}`)
      progress.set(50, 'Source Preflight', 'Memastikan source asal valid sebelum ditransformasi.')
      if (ext === '.js' || ext === '.mjs' || ext === '.cjs') {
        if (!(await validateNodeSource(srcCode, ext))) throw new Error('Source JavaScript asli gagal validasi parser Node. Tidak dipaksakan untuk di-obfuscate.')
      }
      await progress.hold()

      progress.set(54, 'Preparing Engine', `Menyiapkan transformer kompatibel untuk *${ext}*.`)
      await progress.hold()

      const { result, outExt } = await transformByType(srcCode, ext, progress)
      if (timedOut) return

      const outputBuffer = Buffer.from(result, 'utf8')
      if (!outputBuffer.length) throw new Error('Output encode kosong.')
      if (outputBuffer.length > MAX_OUTPUT_SIZE) throw new Error(`Output terlalu besar (${formatBytes(outputBuffer.length)}).`)

      progress.set(90, 'Final Validation', 'Verifikasi syntax, format, ukuran, dan output akhir sebelum file dikirim.')

      const outputName = makeOutputName(fileName, outExt)
      tmpOutput = tempPath(outExt.slice(1))
      await fs.writeFile(tmpOutput, outputBuffer)
      const finalBuffer = await fs.readFile(tmpOutput)

      progress.set(96, 'Packaging', 'Output siap dikirim.', `Ukuran : ${formatBytes(fileBuffer.length)} → ${formatBytes(finalBuffer.length)}`)
      await progress.finish('Encode selesai dan output lolos validasi.', `Security : ${decision.level} • ${deep.lines} baris • SHA256 ${deep.sha256.slice(0, 12)}…`)

      await processConn.sendMessage(
        chat,
        {
          document: finalBuffer,
          mimetype: 'application/octet-stream',
          fileName: outputName,
          caption:
            `╭─「 *ENCODE SUCCESS* 」\n` +
            `│\n` +
            `│ 📄 *File*   : ${fileName}\n` +
            `│ 📦 *Output* : ${outputName}\n` +
            `│ ✅ *Status* : 100% • Berhasil\n` +
            `│ 🧠 *Engine* : AST Hard\n` +
            `│ 🛡️ *Scan*   : ${decision.level} • ${report.total} temuan\n` +
            `│ 🔐 *Hash*   : ${deep.sha256.slice(0, 12)}…\n` +
            `│ 💾 *Ukuran* : ${formatBytes(fileBuffer.length)} → ${formatBytes(finalBuffer.length)}\n` +
            `╰──────────────`,
        },
        { quoted: raw }
      )
    }

    await Promise.race([processFile(), timeout])
  } catch (err) {
    console.error('[ENC ERROR]', err?.stack || err?.message || err)
    const message = normalizeError(err?.message || err)

    if (progress) {
      await progress.fail(message)
    } else {
      await conn.sendMessage(
        chat,
        { text: resultText(fileName, 0, 'ENCODE GAGAL', 'Dihentikan', message) },
        { quoted: raw }
      ).catch(() => {})
    }
  } finally {
    await fs.remove(tmpOutput).catch(() => {})
  }
}

handler.command = /^enc$/i
handler.help = ['enc']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Hard AST source obfuscation with deep static security scan'
handler.limit = false

export default handler
