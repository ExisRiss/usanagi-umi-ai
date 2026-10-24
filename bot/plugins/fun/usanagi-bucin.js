/* By AlzRiss - Usanagi Umi AI */

const localBucin = [
  'Cinta itu seperti angin, tidak terlihat tapi bisa dirasakan.',
  'Kamu adalah alasan aku tersenyum setiap hari.',
  'Jika aku bisa memberi kamu satu hal dalam hidup, aku ingin memberi kamu kesempatan untuk melihat dirimu melalui mataku.',
  'Setiap detik bersamamu terasa seperti selamanya yang indah.',
  'Kamu bukan hanya di hatiku, kamu adalah hatiku.',
  'Aku tidak butuh peta, karena hatiku selalu menuntun ke arahmu.',
  'Jika cinta adalah lagu, maka kamu adalah refren favoritku.',
  'Matamu adalah tempat aku ingin tersesat selamanya.',
  'Aku jatuh cinta padamu bukan karena siapa dirimu, tapi karena siapa aku ketika bersamamu.',
  'Kamu membuat dunia ini lebih indah hanya dengan keberadaanmu.',
  'Setiap kali aku memikirkanmu, senyumku tak terbendung.',
  'Cinta sejati tidak perlu dicari, ia datang saat kamu siap.',
  'Kamu adalah rumah yang selalu ingin aku pulang.',
  'Dalam keramaian, aku hanya mencari wajahmu.',
  'Aku tidak takut jatuh, asalkan jatuhnya ke pelukanmu.'
]

const handler = async (m) => {
  let quote = localBucin[Math.floor(Math.random() * localBucin.length)]

  try {
    const res = await fetch('https://raw.githubusercontent.com/BochilTeam/database/master/kata-kata/bucin.json')
    if (res.ok) {
      const data = await res.json()
      if (Array.isArray(data) && data.length) {
        quote = data[Math.floor(Math.random() * data.length)]
      }
    }
  } catch {}

  await m.reply(
    `*BUCIN*\n\n` +
    `"${quote}"`
  )
}

handler.command = /^(bucin|gombal|romantis)$/i
handler.help = ['bucin']
handler.tags = ['fun']
handler.description = 'Mendapatkan kata-kata bucin / gombalan acak'

export default handler
