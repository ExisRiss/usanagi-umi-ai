
const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export function parseBirthday(input) {
  const values = String(input || '').trim().match(/\d+/g)?.map(Number) || []
  if (values.length < 2 || values.length > 3) return null
  const [day, month, yearValue] = values
  const year = yearValue || null
  if (!Number.isInteger(day) || !Number.isInteger(month) || day < 1 || month < 1 || month > 12) return null
  if (year && (year < 1 || year > new Date().getFullYear())) return null

  // Tahun kabisat diuji menggunakan tahun input; gunakan 2000 jika tahun tidak ada.
  // setFullYear dipakai agar tahun 1-99 tidak diubah otomatis menjadi 1901-1999.
  const validationYear = year || 2000
  const date = new Date(0)
  date.setHours(0, 0, 0, 0)
  date.setFullYear(validationYear, month - 1, day)
  if (date.getFullYear() !== validationYear || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return { day, month, year }
}

export function serializeBirthday(value) {
  if (!value) return ''
  return value.year ? `${value.day}-${value.month}-${value.year}` : `${value.day}-${value.month}`
}

export function calculateAge(value, now = new Date()) {
  if (!value?.year) return null
  let age = now.getFullYear() - value.year
  const beforeBirthday = now.getMonth() + 1 < value.month ||
    (now.getMonth() + 1 === value.month && now.getDate() < value.day)
  if (beforeBirthday) age -= 1
  return age >= 0 ? age : null
}

export function formatBirthday(value) {
  if (!value) return 'Belum di set 🥜'
  const month = MONTHS_ID[value.month - 1]
  if (!month) return 'Belum di set 🥜'
  return value.year ? `${value.day} ${month} ${value.year}` : `${value.day} ${month}`
}

export default { parseBirthday, serializeBirthday, calculateAge, formatBirthday }
