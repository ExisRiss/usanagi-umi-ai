/*
 *
 * Satu sumber kebenaran untuk "apakah limit diberlakukan?".
 *
 * Aturan (Task64):
 *  - Tombol website `limit_enabled` = false  -> tidak ada cek/potong limit sama sekali.
 *  - Limit awal `-1` (unlimited)             -> seluruh bot dianggap unlimited,
 *    termasuk pengguna lama yang masih menyimpan angka limit dari dulu.
 *  - `UMI_LIMIT_ENABLED=0`                   -> matikan limit untuk seluruh proses.
 *
 * Semua jalur yang memakai limit (handler, AutoAI, router awang) WAJIB memakai
 * fungsi ini supaya perilakunya tidak pernah berbeda antar jalur.
 */

function numericDefaultLimit(config) {
  const value = Number(config?.defaultLimit)
  return Number.isFinite(value) ? value : null
}

export function limitsEnabled(config) {
  if (process.env.UMI_LIMIT_ENABLED === '0') return false
  if (config && config.limitEnabled === false) return false
  if (config && config.limitsEnabled === false) return false
  const fallback = numericDefaultLimit(config)
  // -1 adalah sentinel unlimited yang diset dari website/panel.
  if (fallback === -1) return false
  return true
}

export function isUnlimitedUser(user, config) {
  if (!limitsEnabled(config)) return true
  if (!user) return false
  if (Number(user.limit) === -1) return true
  return user.isUnlimitedLimit === true
}

export default { limitsEnabled, isUnlimitedUser }
