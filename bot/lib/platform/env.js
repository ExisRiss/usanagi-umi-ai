/**
 * Pemuatan variabel lingkungan ekosistem dari berkas lokal server.
 *
 * Panel hosting tidak selalu bisa menyuntik env tambahan tanpa akses aplikasi,
 * jadi `bot/.platform.env` (di luar git, permission ketat) dibaca sekali di
 * awal proses. Nilai yang SUDAH ada di process.env tidak pernah ditimpa, supaya
 * environment panel tetap menang.
 *
 * Format: `KEY=value` per baris, `#` untuk komentar, tanpa ekspansi shell.
 */
import fs from 'node:fs'
import path from 'node:path'

const FILE = path.join(process.cwd(), '.platform.env')

function parse(text) {
  const out = {}
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const index = line.indexOf('=')
    if (index <= 0) continue
    const key = line.slice(0, index).trim()
    if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue
    let value = line.slice(index + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    out[key] = value
  }
  return out
}

export function loadPlatformEnv(file = FILE) {
  let text
  try { text = fs.readFileSync(file, 'utf8') } catch { return { loaded: 0, file } }
  const values = parse(text)
  let loaded = 0
  for (const [key, value] of Object.entries(values)) {
    if (value === '') continue
    if (process.env[key] !== undefined && process.env[key] !== '') continue
    process.env[key] = value
    loaded++
  }
  return { loaded, file }
}

loadPlatformEnv()
