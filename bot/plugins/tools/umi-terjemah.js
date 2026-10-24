/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

// Terjemahan memakai API publik MyMemory (tanpa kunci). Bahasa sumber selalu
// dideteksi otomatis, jadi pengguna cukup menulis bahasa tujuan.

const LANG_NAME = {
  id: 'Indonesia', en: 'Inggris', jw: 'Jawa', su: 'Sunda', ms: 'Melayu', ar: 'Arab',
  ja: 'Jepang', ko: 'Korea', zh: 'Mandarin', es: 'Spanyol', fr: 'Prancis', de: 'Jerman',
  nl: 'Belanda', pt: 'Portugis', ru: 'Rusia', hi: 'Hindi', th: 'Thailand', vi: 'Vietnam',
}

const handler = async (m, { text, usedPrefix, command }) => {
  const usage = `🌐 *UMI TERJEMAH — Umi Usanagi AI*\n\nContoh:\n${usedPrefix + command} en Selamat pagi, apa kabar?\n${usedPrefix + command} id Good morning everyone\n${usedPrefix + command} ja Terima kasih banyak\n\nKode bahasa: ${Object.keys(LANG_NAME).join(', ')}`

  if (!text) return m.reply(usage)

  let target = 'en'
  let phrase = text.trim()
  const first = phrase.split(/\s+/)[0].toLowerCase()
  if (/^[a-z]{2}$/.test(first) && LANG_NAME[first]) {
    target = first
    phrase = phrase.slice(first.length).trim()
  }
  if (!phrase) return m.reply(usage)
  if (phrase.length > 800) return m.reply('Teks terlalu panjang (maks 800 karakter per terjemahan).')

  await m.react?.('⏳').catch(() => {})
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(phrase)}&langpair=autodetect|${target}`
    const res = await fetch(url, { signal: AbortSignal.timeout(20000) })
    const raw = await res.text()
    if (/^\s*</.test(raw)) throw new Error('Layanan terjemahan membalas halaman HTML.')
    const data = JSON.parse(raw)
    const translated = data?.responseData?.translatedText
    if (!translated) throw new Error(data?.responseDetails || 'Hasil terjemahan kosong.')

    await m.react?.('✅').catch(() => {})
    return m.reply(`🌐 *Terjemahan (${LANG_NAME[target]}) — Umi Usanagi AI*\n\n${translated}`)
  } catch (error) {
    await m.react?.('❌').catch(() => {})
    return m.reply(`❌ Gagal menerjemahkan: ${String(error?.message || error).slice(0, 160)}`)
  }
}

handler.help = ['umiterjemah <kode> <teks>']
handler.tags = ['tools', 'ai']
handler.category = 'tools'
handler.command = /^(umiterjemah|terjemahumi)$/i
handler.description = 'Terjemah teks ke banyak bahasa (Umi Usanagi AI)'

export default handler
