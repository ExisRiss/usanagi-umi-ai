/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

import crypto from 'node:crypto'

const SETS = {
  lower: 'abcdefghijkmnopqrstuvwxyz', // tanpa l (mudah tertukar)
  upper: 'ABCDEFGHJKLMNPQRSTUVWXYZ', // tanpa I/O
  digit: '23456789', // tanpa 0/1
  symbol: '!@#$%^&*()-_=+',
}

function generate(length) {
  const alphabet = SETS.lower + SETS.upper + SETS.digit + SETS.symbol
  const pick = (set) => set[crypto.randomInt(set.length)]
  // Jamin minimal satu karakter dari tiap kelompok.
  const chars = [pick(SETS.lower), pick(SETS.upper), pick(SETS.digit), pick(SETS.symbol)]
  while (chars.length < length) chars.push(pick(alphabet))
  // Acak posisi dengan Fisher-Yates memakai RNG kriptografis.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return { password: chars.join(''), alphabetSize: alphabet.length }
}

const handler = async (m, { args, usedPrefix, command }) => {
  const length = Math.min(64, Math.max(8, parseInt(args[0]) || 16))
  const { password, alphabetSize } = generate(length)
  const bits = Math.round(length * Math.log2(alphabetSize))
  const strength = bits >= 100 ? 'Sangat kuat 🟢' : bits >= 75 ? 'Kuat 🟢' : bits >= 55 ? 'Cukup 🟡' : 'Lemah 🔴'

  return m.reply(
    `🔐 *UMI SANDI — Umi Usanagi AI*\n\n\`${password}\`\n\nPanjang: ${length} karakter\nEntropi: ±${bits} bit · ${strength}\n\n_Simpan di pengelola kata sandi. Jangan bagikan sandi ini ke siapa pun._\nContoh lain: ${usedPrefix + command} 24`,
  )
}

handler.help = ['umisandi [panjang]']
handler.tags = ['tools']
handler.category = 'tools'
handler.command = /^(umisandi|sandiumi|buatpassword)$/i
handler.description = 'Buat kata sandi acak yang kuat (Umi Usanagi AI)'

export default handler
