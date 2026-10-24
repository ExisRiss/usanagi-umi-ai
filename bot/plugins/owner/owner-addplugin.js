
import fs from 'node:fs/promises'
import path from 'node:path'
import syntaxError from 'syntax-error'

const BRAND = global.brandCredit || 'By AlzRiss - Usanagi Umi AI'

function installerConfig() {
  const value = global.pluginInstaller || {}
  const pluginRoot = path.resolve('./plugins')
  const requested = String(value.directory || 'custom').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')
  const candidate = path.resolve(pluginRoot, requested)
  const directory = candidate.startsWith(pluginRoot + path.sep) ? candidate : path.join(pluginRoot, 'custom')
  return {
    enabled: value.enabled !== false,
    pluginRoot,
    directory,
    maxBytes: Math.max(1024, Number(value.maxBytes) || 256 * 1024),
    keepBackups: value.keepBackups !== false
  }
}

function cleanCodeFence(value) {
  let code = String(value || '').replace(/^\uFEFF/, '').trim()
  const fenced = code.match(/^```(?:javascript|js|mjs)?\s*\n?([\s\S]*?)\n?```$/i)
  if (fenced) code = fenced[1].trim()
  return code
}

async function codeFromReply(m) {
  const quoted = m.quoted
  if (!quoted) throw new Error('Reply pesan berisi kode plugin atau file JavaScript.')

  const text = quoted.text || quoted.caption
  if (typeof text === 'string' && text.trim()) return cleanCodeFence(text)

  if (typeof quoted.download === 'function') {
    const buffer = await quoted.download()
    if (!buffer?.length) throw new Error('File plugin tidak dapat diunduh.')
    return cleanCodeFence(buffer.toString('utf8'))
  }

  throw new Error('Kode plugin tidak terbaca. Reply teks kode atau dokumen .js.')
}

function safeFilename(input) {
  const raw = String(input || '').replace(/\.m?js$/i, '').trim().toLowerCase()
  const name = raw
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
  return `${name || `plugin-${Date.now()}`}.js`
}

function securityCheck(code) {
  const rules = [
    [/\b(?:child_process|node:child_process)\b/i, 'akses child_process'],
    [/\b(?:execSync|execFileSync|spawnSync|execFile|spawn)\s*\(/i, 'eksekusi proses sistem'],
    [/\b(?:eval|Function)\s*\(/i, 'eksekusi kode dinamis'],
    [/\bprocess\s*\.\s*(?:env|exit|kill)\b/i, 'akses proses sensitif'],
    [/(?:sessions[\\/]|creds\.json|\.env\b)/i, 'akses kredensial/session'],
    [/\bfs\s*\.\s*(?:rm|rmSync|rmdir|rmdirSync)\s*\(/i, 'penghapusan filesystem'],
    [/(?:config|main|handler)\.js["'`]?\s*,?\s*(?:\)|,)/i, 'perubahan file inti'],
    [/handler\s*\.\s*command\s*=\s*[^\n]*(?:addplugin|installplugin)/i, 'pengambilalihan command installer']
  ]
  const blocked = rules.filter(([pattern]) => pattern.test(code)).map(([, label]) => label)
  if (blocked.length) throw new Error(`Plugin ditolak oleh pemeriksaan keamanan: ${blocked.join(', ')}.`)
}

function validateShape(code, filename) {
  const error = syntaxError(code, filename, {
    sourceType: 'module',
    allowAwaitOutsideFunction: true
  })
  if (error) throw new Error(`Syntax tidak valid: ${error.message}`)
  if (!/\bexport\s+default\b/.test(code)) throw new Error('Plugin wajib memiliki export default handler.')
  if (!/handler\s*\.\s*command\s*=/.test(code)) throw new Error('Plugin wajib memiliki handler.command.')
  securityCheck(code)
}

async function restoreOrRemove(target, backup) {
  await fs.rm(target, { force: true }).catch(() => {})
  if (backup) await fs.copyFile(backup, target).catch(() => {})
}

const handler = async (m, { text }) => {
  const config = installerConfig()
  if (!config.enabled) throw new Error('Installer plugin sedang dinonaktifkan di config.js.')

  const args = String(text || '').trim().split(/\s+/).filter(Boolean)
  const replace = args.includes('--replace')
  const requestedName = args.find(value => !value.startsWith('--'))
  const filename = safeFilename(requestedName)
  const code = await codeFromReply(m)

  if (!code) throw new Error('Kode plugin kosong.')
  const size = Buffer.byteLength(code)
  if (size > config.maxBytes) throw new Error(`Plugin terlalu besar: ${size} byte. Maksimal ${config.maxBytes} byte.`)
  validateShape(code, filename)

  await fs.mkdir(config.directory, { recursive: true })
  const target = path.join(config.directory, filename)
  const relative = path.relative(config.pluginRoot, target).replace(/\\/g, '/')
  let exists = false
  try { await fs.access(target); exists = true } catch {}
  if (exists && !replace) {
    throw new Error(`Plugin ${filename} sudah ada. Tambahkan --replace untuk menggantinya.`)
  }

  let backup = ''
  if (exists && config.keepBackups) {
    const backupDir = path.join(config.directory, '.backups')
    await fs.mkdir(backupDir, { recursive: true })
    backup = path.join(backupDir, `${filename}.${Date.now()}.bak`)
    await fs.copyFile(target, backup)
  }

  const temporary = path.join(config.directory, `.${filename}.${process.pid}.tmp`)
  try {
    await fs.writeFile(temporary, `${code.trim()}\n`, { encoding: 'utf8', mode: 0o600 })
    await fs.rename(temporary, target)
    if (typeof global.reload !== 'function') throw new Error('Hot reload plugin belum tersedia.')
    await global.reload(null, relative)

    const loaded = global.plugins?.[relative]
    if (typeof loaded !== 'function') {
      await restoreOrRemove(target, backup)
      if (backup) await global.reload(null, relative)
      throw new Error('Plugin gagal dimuat saat validasi runtime. Instalasi dibatalkan.')
    }

    await m.reply([
      '✅ *PLUGIN BERHASIL DITAMBAHKAN*',
      '',
      `📄 File: plugins/${relative}`,
      `📦 Ukuran: ${size.toLocaleString('id-ID')} byte`,
      `♻️ Mode: ${exists ? 'replace' : 'baru'}`,
      '⚡ Status: sudah dimuat tanpa restart',
      '',
      BRAND
    ].join('\n'))
  } catch (error) {
    await fs.rm(temporary, { force: true }).catch(() => {})
    throw error
  }
}

handler.help = ['addplugin [nama] [--replace] (reply kode/file .js)']
handler.tags = ['owner']
handler.command = /^(addplugin|installplugin)$/i
handler.rowner = true
handler.limit = false

export default handler
