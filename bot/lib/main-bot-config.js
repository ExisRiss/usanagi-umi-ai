/*
 *
 * State bot utama: aktif/nonaktif + nomor pairing.
 *
 * Disimpan sebagai file .env di direktori kerja container (di luar repo),
 * dengan izin 600. Tujuannya:
 *   - setting bisa diubah dari website tanpa mengedit kode,
 *   - nomor tidak ikut ter-commit, ter-backup, atau tampil di log,
 *   - bot utama bisa dimatikan total sehingga tidak lagi mencoba menyambung
 *     dan tidak memunculkan prompt pairing berulang kali.
 *
 * Prioritas nilai: file > environment proses > default.
 */
import fs from 'node:fs'
import path from 'node:path'

/**
 * Lokasi berkas state. Bisa diarahkan lewat `UMI_MAIN_BOT_ENV_FILE` supaya
 * pengujian tidak menyentuh berkas sungguhan di direktori kerja bot.
 */
function stateFile() {
  return process.env.UMI_MAIN_BOT_ENV_FILE
    ? path.resolve(process.env.UMI_MAIN_BOT_ENV_FILE)
    : path.join(process.cwd(), '.main-bot.env')
}

/** Baca file .env sederhana menjadi objek. */
function parseEnvFile(source) {
  const out = {}
  for (const line of String(source || '').split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const index = trimmed.indexOf('=')
    if (index < 1) continue
    out[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim()
  }
  return out
}

function readFileSafe() {
  try {
    return parseEnvFile(fs.readFileSync(stateFile(), 'utf8'))
  } catch {
    return {}
  }
}

/** Hanya angka. Nomor disimpan tanpa "+" dan tanpa spasi. */
export function normalizeMainBotNumber(value) {
  let number = String(value ?? '').replace(/\D/g, '')
  if (number.startsWith('0')) number = `62${number.slice(1)}`
  else if (number.startsWith('8')) number = `62${number}`
  return number
}

/**
 * @returns {{enabled: boolean, pairingNumber: string, source: string}}
 */
export function readMainBotState() {
  const file = readFileSafe()

  const enabledRaw = file.MAIN_BOT_ENABLED ?? process.env.MAIN_BOT_ENABLED
  // Default aktif: perilaku lama tidak berubah kalau file belum ada.
  const enabled = enabledRaw === undefined ? true : String(enabledRaw).toLowerCase() === 'true'

  const pairingNumber = normalizeMainBotNumber(
    file.MAIN_BOT_PAIRING_NUMBER || process.env.PAIRING_NUMBER || ''
  )

  return { enabled, pairingNumber, source: fs.existsSync(stateFile()) ? stateFile() : 'environment/default' }
}

/** Tulis ulang file dengan nilai yang digabung dari state saat ini. */
export function writeMainBotState(patch = {}) {
  const current = readMainBotState()
  const next = {
    enabled: patch.enabled === undefined ? current.enabled : Boolean(patch.enabled),
    pairingNumber:
      patch.pairingNumber === undefined ? current.pairingNumber : normalizeMainBotNumber(patch.pairingNumber),
  }

  const body =
    '# Diatur otomatis oleh website (halaman Bot Utama). Jangan di-commit.\n' +
    `MAIN_BOT_ENABLED=${next.enabled}\n` +
    `MAIN_BOT_PAIRING_NUMBER=${next.pairingNumber}\n`

  try {
    fs.writeFileSync(stateFile(), body, { mode: 0o600 })
  } catch (error) {
    throw Object.assign(new Error(`Gagal menyimpan setting bot utama: ${error.message}`), { status: 500 })
  }

  return next
}

export const MAIN_BOT_STATE_FILE = path.join(process.cwd(), '.main-bot.env')
export { stateFile as mainBotStateFile }
