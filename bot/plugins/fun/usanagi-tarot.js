
import sharp from 'sharp'
import crypto from 'node:crypto'

const CARDS = [
  ['The Fool', 'Awal baru, petualangan, kebebasan', 'Berani memulai sesuatu yang baru, tetapi tetap perhatikan langkahmu.'],
  ['The Magician', 'Kreativitas, fokus, manifestasi', 'Kemampuan yang kamu perlukan sudah ada; gunakan dengan percaya diri.'],
  ['The High Priestess', 'Intuisi, misteri, kebijaksanaan', 'Tenangkan pikiran dan dengarkan intuisi sebelum mengambil keputusan.'],
  ['The Empress', 'Kelimpahan, kasih sayang, pertumbuhan', 'Rawat hubungan dan rencana yang sedang tumbuh dengan konsisten.'],
  ['The Emperor', 'Struktur, stabilitas, kepemimpinan', 'Disiplin dan batas yang jelas akan membantumu hari ini.'],
  ['The Hierophant', 'Tradisi, bimbingan, pembelajaran', 'Belajar dari pengalaman orang tepercaya sebelum melangkah.'],
  ['The Lovers', 'Cinta, pilihan, harmoni', 'Pilih berdasarkan nilai yang benar-benar penting bagimu.'],
  ['The Chariot', 'Tekad, kemenangan, kendali', 'Jaga fokus; kemajuan datang ketika energi diarahkan pada satu tujuan.'],
  ['Strength', 'Keberanian, kesabaran, keteguhan', 'Kelembutan dan pengendalian diri lebih kuat daripada tindakan terburu-buru.'],
  ['The Hermit', 'Introspeksi, pencarian, petunjuk', 'Luangkan waktu sendiri untuk menemukan jawaban yang lebih jernih.'],
  ['Wheel of Fortune', 'Siklus, perubahan, kesempatan', 'Perubahan membuka peluang baru; tetap siap menyesuaikan diri.'],
  ['Justice', 'Kebenaran, keseimbangan, sebab-akibat', 'Bertindaklah jujur karena setiap pilihan membawa konsekuensi.'],
  ['The Hanged Man', 'Perspektif baru, jeda, pelepasan', 'Berhenti sejenak dan lihat masalah dari sudut yang berbeda.'],
  ['Death', 'Transformasi, akhir, kelahiran kembali', 'Lepaskan fase yang selesai agar sesuatu yang lebih baik dapat tumbuh.'],
  ['Temperance', 'Keseimbangan, moderasi, kesabaran', 'Hindari berlebihan dan cari ritme yang dapat dipertahankan.'],
  ['The Devil', 'Keterikatan, godaan, bayangan', 'Kenali kebiasaan yang membatasi dan pilih untuk membebaskan diri.'],
  ['The Tower', 'Guncangan, wahyu, perubahan mendadak', 'Hal yang runtuh mungkin sedang membuka fondasi yang lebih jujur.'],
  ['The Star', 'Harapan, inspirasi, pemulihan', 'Pertahankan harapan dan lanjutkan langkah kecil menuju tujuanmu.'],
  ['The Moon', 'Ilusi, mimpi, alam bawah sadar', 'Jangan mengambil kesimpulan sebelum fakta menjadi lebih jelas.'],
  ['The Sun', 'Kebahagiaan, vitalitas, keberhasilan', 'Nikmati energi positif dan bagikan kehangatan kepada orang lain.'],
  ['Judgement', 'Refleksi, kebangkitan, panggilan', 'Gunakan pelajaran masa lalu untuk menjadi versi dirimu yang lebih baik.'],
  ['The World', 'Pencapaian, integrasi, penyelesaian', 'Sebuah siklus mendekati selesai; rayakan kemajuanmu.'],
]

const xml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[char]))

function dailyCard(sender) {
  const day = new Date().toISOString().slice(0, 10)
  const hash = crypto.createHash('sha256').update(`${sender}:${day}`).digest()
  return { index: hash[0] % CARDS.length, reversed: hash[1] % 4 === 0 }
}

async function fetchCard(index) {
  const urls = [
    `https://ishtarcollective.blob.core.windows.net/rider-waite-tarot/major-${index}.jpg`,
    `https://www.sacred-texts.com/tarot/rwcs/img/rwcs${String(index + 1).padStart(2, '0')}.jpg`,
  ]
  for (const url of urls) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(12000) })
      if (response.ok) return Buffer.from(await response.arrayBuffer())
    } catch {}
  }
  return null
}

function wrap(value, max = 43) {
  const lines = []
  let line = ''
  for (const word of String(value).split(/\s+/)) {
    if (line && `${line} ${word}`.length > max) { lines.push(line); line = word }
    else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines
}

async function renderCard(index, reversed) {
  const [name, keywords, meaning] = CARDS[index]
  const meaningLines = wrap(meaning).map((line, i) => `<text x="350" y="${190 + i * 38}" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#eafaff">${xml(line)}</text>`).join('')
  const remote = await fetchCard(index)
  const art = remote
    ? await sharp(remote).resize(700, 1110, { fit: 'cover' }).rotate(reversed ? 180 : 0).toBuffer()
    : await sharp({ create: { width: 700, height: 1110, channels: 3, background: '#182341' } }).png().toBuffer()
  const panel = Buffer.from(`<svg width="700" height="380" xmlns="http://www.w3.org/2000/svg">
    <rect width="700" height="380" fill="#071222"/>
    <rect x="14" y="14" width="672" height="352" fill="none" stroke="#62e6ff" stroke-width="3"/>
    <text x="350" y="75" text-anchor="middle" font-family="sans-serif" font-size="38" font-weight="800" fill="#ffffff">${xml(name.toUpperCase())}${reversed ? ' · TERBALIK' : ''}</text>
    <text x="350" y="122" text-anchor="middle" font-family="sans-serif" font-size="21" fill="#62e6ff">${xml(keywords)}</text>
    ${meaningLines}
    <text x="350" y="340" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#a5c8d3">By AlzRiss - Usanagi Umi AI</text>
  </svg>`)
  return sharp({ create: { width: 700, height: 1490, channels: 3, background: '#071222' } })
    .composite([{ input: art, top: 0, left: 0 }, { input: panel, top: 1110, left: 0 }])
    .jpeg({ quality: 91 })
    .toBuffer()
}

const handler = async (m, { conn }) => {
  await m.react?.('🔮')
  try {
    const { index, reversed } = dailyCard(m.sender)
    const [name, keywords, meaning] = CARDS[index]
    const image = await renderCard(index, reversed)
    const caption = `🔮 *TAROT HARI INI*\n\n🃏 *${name}*${reversed ? ' — Terbalik' : ''}\n✨ ${keywords}\n\n${meaning}\n\n_Hiburan dan refleksi pribadi, bukan kepastian masa depan._\n\nBy AlzRiss - Usanagi Umi AI`
    await conn.sendMessage(m.chat, { image, caption }, { quoted: m.raw })
  } catch (error) {
    console.error('[TAROT]', error)
    return m.reply(`Gagal membuat kartu tarot: ${error.message}`)
  }
}

handler.command = /^(tarot|karturama|ramalan|fortune)$/i
handler.help = ['tarot']
handler.tags = ['fun']
handler.limit = true
handler.description = 'Menampilkan kartu tarot harian untuk hiburan dan refleksi'

export default handler
