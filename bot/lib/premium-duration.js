
const HOUR_MS = 60 * 60 * 1000
const UNIT_MILLISECONDS = Object.freeze({
  j: HOUR_MS,
  h: 24 * HOUR_MS,
  b: 30 * 24 * HOUR_MS,
  t: 365 * 24 * HOUR_MS,
})
const UNIT_NAMES = Object.freeze({ j: 'Jam', h: 'Hari', b: 'Bulan', t: 'Tahun' })

export function parsePremiumDuration(value, { allowLegacyDays = false } = {}) {
  const raw = String(value || '').trim().toLowerCase()
  if (raw === 'permanen' || raw === 'permanent') {
    return {
      permanent: true,
      overflow: false,
      raw,
      amount: null,
      amountText: '',
      unit: null,
      milliseconds: null,
      label: 'Permanen',
    }
  }

  const pattern = allowLegacyDays ? /^(\d+)([jhbt])?$/ : /^(\d+)([jhbt])$/
  const match = raw.match(pattern)
  if (!match) return null

  const amountText = match[1].replace(/^0+(?=\d)/, '')
  if (!amountText || /^0+$/.test(amountText)) return null
  // Cegah input tak wajar memenuhi memori, tanpa memberi batas durasi kalender.
  if (amountText.length > 1000) return null

  const unit = match[2] || 'h'
  let totalMilliseconds
  try {
    totalMilliseconds = BigInt(amountText) * BigInt(UNIT_MILLISECONDS[unit])
  } catch {
    return null
  }

  const overflow = totalMilliseconds > BigInt(Number.MAX_SAFE_INTEGER)
  const safeAmount = BigInt(amountText) <= BigInt(Number.MAX_SAFE_INTEGER)
    ? Number(amountText)
    : amountText

  return {
    permanent: false,
    overflow,
    raw,
    amount: safeAmount,
    amountText,
    unit,
    milliseconds: overflow ? null : Number(totalMilliseconds),
    label: `${amountText} ${UNIT_NAMES[unit]}`,
  }
}

export function premiumDurationHelp(prefix = '.', command = 'addprem') {
  return [
    '*FORMAT ADD PREMIUM*',
    '',
    `${prefix}${command} (nomor/tag) (durasi)`,
    `Reply pesan: ${prefix}${command} (durasi)`,
    '',
    '*Satuan durasi:*',
    '• j = jam',
    '• h = hari',
    '• b = bulan (30 hari)',
    '• t = tahun (365 hari)',
    '',
    '*Contoh:*',
    `${prefix}${command} 628xxxxxxxxxx 99h`,
    `${prefix}${command} @user 12j`,
    `${prefix}${command} 6b  (sambil reply pesan)`,
    `${prefix}${command} 2t 628xxxxxxxxxx`,
    `${prefix}${command} 628xxxxxxxxxx permanen`,
    '',
    'Durasi yang melampaui kalender sistem otomatis menjadi praktis permanen.',
  ].join('\n')
}

export default { parsePremiumDuration, premiumDurationHelp }
