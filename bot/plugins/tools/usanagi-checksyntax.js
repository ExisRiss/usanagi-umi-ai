
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const ALLOWED = new Set(['js', 'mjs', 'cjs', 'json'])

function fileNameOf(m) {
  const msg = m.quoted?.msg || m.quoted?.message?.documentMessage || m.msg || {}
  return String(msg.fileName || msg.title || '').trim()
}

function securityNotes(code) {
  const rules = [
    [/\beval\s*\(/, 'eval() terdeteksi'],
    [/\bnew\s+Function\s*\(/, 'new Function() terdeteksi'],
    [/child_process|node:child_process/, 'child_process digunakan'],
    [/\bexec(?:Sync)?\s*\(/, 'eksekusi command sistem terdeteksi'],
    [/process\.env\b/, 'environment variable digunakan'],
    [/(?:api[_-]?key|token|password)\s*[:=]\s*['"][^'"]{8,}/i, 'kemungkinan credential hardcoded'],
    [/rm\s*\([^)]*recursive\s*:\s*true/, 'penghapusan rekursif terdeteksi'],
  ]
  return rules.filter(([pattern]) => pattern.test(code)).map(([, label]) => label)
}

function summarize(code) {
  return {
    lines: code.split(/\r?\n/).length,
    chars: code.length,
    functions: (code.match(/\bfunction\b|=>/g) || []).length,
    imports: (code.match(/\bimport\b|\brequire\s*\(/g) || []).length,
    todos: (code.match(/TODO|FIXME/gi) || []).length,
  }
}

const handler = async (m, { usedPrefix, command }) => {
  if (!m.quoted?.download) return m.reply(`Reply file JavaScript atau JSON.\n\nContoh: ${usedPrefix}${command}`)
  const name = fileNameOf(m)
  const ext = path.extname(name).slice(1).toLowerCase()
  if (!ALLOWED.has(ext)) return m.reply('Format yang didukung: .js, .mjs, .cjs, dan .json.')
  await m.react?.('🔍')
  let temp = ''
  try {
    const buffer = await m.quoted.download()
    if (!buffer?.length) throw new Error('File kosong atau gagal diunduh.')
    if (buffer.length > 512 * 1024) throw new Error('Ukuran file maksimal 512 KB.')
    const code = buffer.toString('utf8')
    const stats = summarize(code)
    const notes = securityNotes(code)
    let valid = true
    let output = ''

    if (ext === 'json') {
      try { JSON.parse(code) } catch (error) { valid = false; output = error.message }
    } else {
      temp = path.join(os.tmpdir(), `umi-check-${crypto.randomUUID()}.${ext}`)
      await fs.writeFile(temp, buffer, { mode: 0o600 })
      try {
        await execFileAsync(process.execPath, ['--check', temp], { timeout: 12000, maxBuffer: 128 * 1024 })
      } catch (error) {
        valid = false
        output = String(error.stderr || error.message).replaceAll(temp, name || `file.${ext}`).slice(0, 2500)
      }
    }

    const report = [
      `🧪 *UMI STATIC FILE CHECK*`,
      '',
      `📄 File: ${name || `file.${ext}`}`,
      `📦 Ukuran: ${(buffer.length / 1024).toFixed(1)} KB`,
      `🧾 Baris: ${stats.lines}`,
      `⚙️ Fungsi: ${stats.functions}`,
      `📥 Import/require: ${stats.imports}`,
      `📝 TODO/FIXME: ${stats.todos}`,
      `✅ Syntax: ${valid ? 'VALID' : 'ERROR'}`,
      '',
      notes.length ? `⚠️ *Catatan keamanan statis:*\n${notes.map(value => `• ${value}`).join('\n')}` : '🛡️ Tidak ditemukan pola risiko utama pada pemindaian statis.',
      output ? `\n*Detail parser:*\n\`\`\`\n${output}\n\`\`\`` : '',
      '',
      '_File hanya diparsing, tidak pernah dijalankan._',
      'By AlzRiss - Usanagi Umi AI',
    ].filter(Boolean).join('\n')
    await m.reply(report)
    await m.react?.(valid ? '✅' : '❌')
  } catch (error) {
    await m.react?.('❌')
    return m.reply(`Pemeriksaan gagal: ${error.message}`)
  } finally {
    if (temp) await fs.rm(temp, { force: true }).catch(() => {})
  }
}

handler.command = /^(cekfile|checkfile|checksyntax|syntaxcheck|filecheck|analisafile|lintfile)$/i
handler.help = ['cekfile <reply file>']
handler.tags = ['tools']
handler.limit = true
handler.description = 'Memeriksa syntax dan pola keamanan file tanpa menjalankannya'

export default handler
