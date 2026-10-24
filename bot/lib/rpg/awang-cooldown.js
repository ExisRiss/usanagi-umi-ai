/* By AlzRiss - Usanagi Umi AI */

import { checkCooldown, setCooldown } from './awang-db.js'

function formatDuration(ms) {
  const totalSeconds = Math.ceil(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const parts = []
  if (days) parts.push(`${days} hari`)
  if (hours) parts.push(`${hours} jam`)
  if (minutes) parts.push(`${minutes} menit`)
  if (seconds && days === 0) parts.push(`${seconds} detik`)

  return parts.length ? parts.join(' ') : 'sebentar lagi'
}

async function enforceCooldown(m, commandName, durationMs) {
  if (!durationMs) return false

  const status = checkCooldown(m.sender, commandName)
  if (status.onCooldown) {
    await m.reply(`⏳ Tunggu *${formatDuration(status.remaining)}* lagi sebelum pakai perintah ini lagi ya.`)
    return true
  }

  setCooldown(m.sender, commandName, durationMs)
  return false
}

export { enforceCooldown, formatDuration }

export default { enforceCooldown, formatDuration }
