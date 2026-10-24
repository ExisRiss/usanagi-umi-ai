/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

// Ringkasan ekstraktif lokal: kalimat diberi skor dari frekuensi kata penting,
// lalu kalimat terbaik dipilih dan diurutkan kembali seperti teks aslinya.
// Tidak butuh kunci API dan tetap jalan saat layanan luar mati.

const STOPWORDS = new Set((
  'yang dan di ke dari untuk dengan pada adalah ini itu atau juga akan tidak ada dalam oleh sebagai telah dapat ' +
  'karena saat sudah antara lebih para kita saya kamu dia mereka ia nya lah pun si sang maka agar supaya ketika ' +
  'setelah sebelum tentang menjadi seperti hanya saja masih kini yaitu yakni antara dapat bisa harus jadi kalau ' +
  'the a an and or of to in is are was were be been for on with as by at from it its this that these those not no ' +
  'but if then than so such into about over under more most other some any only own same can will just should now'
).split(/\s+/))

function splitSentences(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .match(/[^.!?…]+[.!?…]+["')\]]*|\S[^.!?…]*$/g)
    ?.map(s => s.trim())
    .filter(s => s.length > 25) || []
}

function summarize(text, maxSentences = 3) {
  const sentences = splitSentences(text)
  if (sentences.length <= maxSentences) return { summary: sentences.join(' '), total: sentences.length, picked: sentences.length }

  const freq = new Map()
  for (const word of String(text).toLowerCase().match(/[a-zà-ÿ0-9]{3,}/gi) || []) {
    if (!STOPWORDS.has(word)) freq.set(word, (freq.get(word) || 0) + 1)
  }

  const scored = sentences.map((sentence, index) => {
    const words = sentence.toLowerCase().match(/[a-zà-ÿ0-9]{3,}/gi) || []
    const score = words.reduce((sum, w) => sum + (freq.get(w) || 0), 0) / Math.max(words.length, 1)
    // Kalimat awal biasanya memuat inti berita/artikel: beri sedikit keunggulan.
    return { sentence, index, score: score * (index === 0 ? 1.25 : 1) }
  })

  const picked = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.index - b.index)

  return { summary: picked.map(p => p.sentence).join(' '), total: sentences.length, picked: picked.length }
}

async function textFromUrl(url) {
  const res = await fetch(url, {
    redirect: 'follow',
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36', Accept: 'text/html,text/plain' },
    signal: AbortSignal.timeout(20000),
  })
  if (!res.ok) throw new Error(`Sumber membalas HTTP ${res.status}.`)
  const raw = await res.text()
  if (!/html/i.test(res.headers.get('content-type') || '')) return raw
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
}

const handler = async (m, { text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(`📝 *UMI RINGKAS — Umi Usanagi AI*\n\nRingkas teks panjang atau isi halaman web.\n\nContoh:\n${usedPrefix + command} <teks panjang>\n${usedPrefix + command} https://contoh.com/artikel`)
  }

  await m.react?.('⏳').catch(() => {})
  try {
    const isUrl = /^https?:\/\/\S+$/i.test(text.trim())
    const source = isUrl ? await textFromUrl(text.trim()) : text
    if (!source || source.trim().length < 200) {
      await m.react?.('❌').catch(() => {})
      return m.reply('Teks terlalu pendek untuk diringkas (minimal ±200 karakter).')
    }

    const { summary, total, picked } = summarize(source, 3)
    const words = source.split(/\s+/).length
    await m.react?.('✅').catch(() => {})
    return m.reply(`📝 *RINGKASAN — Umi Usanagi AI*\n\n${summary}\n\n—\n📊 ${words} kata · ${total} kalimat → diringkas jadi ${picked} kalimat${isUrl ? ' · sumber: tautan' : ''}`)
  } catch (error) {
    await m.react?.('❌').catch(() => {})
    return m.reply(`❌ Gagal meringkas: ${String(error?.message || error).slice(0, 160)}`)
  }
}

handler.help = ['umiringkas <teks/url>']
handler.tags = ['tools', 'ai']
handler.category = 'tools'
handler.command = /^(umiringkas|ringkasumi)$/i
handler.description = 'Ringkas teks atau halaman web tanpa kunci API (Umi Usanagi AI)'

export default handler
export { summarize }
