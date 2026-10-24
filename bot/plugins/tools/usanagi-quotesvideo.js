
import { downloadMediaBuffer, getMediaSource, getMimeType, react } from '../../lib/awang-media.js'
import { renderQuotesVideo } from '../../lib/awang-engine.js'

const claims = new Map()
const busyChats = new Set()
const CLAIM_TTL = 10 * 60 * 1000

function messageKey(m) {
  return `${String(m?.chat || m?.key?.remoteJid || '')}:${String(m?.key?.id || m?.id || '')}`
}

function pruneClaims(now = Date.now()) {
  for (const [key, time] of claims) {
    if (now - time > CLAIM_TTL) claims.delete(key)
  }
}

function parseQuotesInput(text) {
  const value = String(text || '').trim()
  const separator = value.indexOf('|')
  if (separator < 0) return null
  const heading = value.slice(0, separator).trim()
  const quote = value.slice(separator + 1).trim()
  if (!heading || !quote) return null
  return { heading, quote }
}

function getVideoSource(m) {
  const source = getMediaSource(m, ['video', 'document'])
  if (!source) return null
  const mime = getMimeType(source, '')
  if (source.type === 'video') return source
  if (source.type === 'document' && /^video\//i.test(mime)) return source
  return null
}

async function replyUsage(m, usedPrefix = '.') {
  await m.reply([
    'Format belum lengkap.',
    '',
    `Gunakan: *${usedPrefix}quotesvideo HEADING | QUOTE*`,
    'Kirim langsung bersama video atau reply video yang akan diproses.',
  ].join('\n'))
}

async function sendResult(rawConn, m, result) {
  const jid = m?.chat || m?.key?.remoteJid
  if (!jid) throw Object.assign(new Error('Tujuan pesan tidak ditemukan.'), { code: 'OUTPUT' })
  await rawConn.sendMessage(jid, {
    video: result.buffer,
    mimetype: 'video/mp4',
    fileName: `Usanagi-QuotesVideo-${Date.now()}.mp4`,
    caption: 'Video quotes berhasil dibuat.\nNikmati hasilnya.',
  }, { quoted: m.raw })
}

const handler = async (m, { rawConn, usedPrefix }) => {
  const input = parseQuotesInput(m?.text || '')
  if (!input) {
    await replyUsage(m, usedPrefix)
    return { status: false }
  }

  const source = getVideoSource(m)
  if (!source) {
    await m.reply('Video belum ditemukan.\nKirim video bersama command ini atau reply video lalu jalankan kembali.')
    return { status: false }
  }

  pruneClaims()
  const key = messageKey(m)
  if (claims.has(key)) return { status: false, duplicate: true }
  const chatKey = String(m?.chat || m?.key?.remoteJid || '')
  if (busyChats.has(chatKey)) {
    await m.reply('Proses quotesvideo sebelumnya masih berjalan.\nTunggu sampai selesai lalu coba lagi.')
    return { status: false }
  }

  claims.set(key, Date.now())
  busyChats.add(chatKey)
  try {
    await react(rawConn, m, '⏳')
    await m.reply('Sedang membuat video quotes...')
    const buffer = await downloadMediaBuffer(source)
    const mime = getMimeType(source, 'video/mp4')
    const result = await renderQuotesVideo(input.heading, input.quote, buffer, mime)
    await sendResult(rawConn, m, result)
    await react(rawConn, m, '✅')
    return { status: true, result }
  } catch (error) {
    await react(rawConn, m, '❌')
    const publicMessage = error?.publicMessage || (error?.stage && /normalize/i.test(String(error.stage)) ? 'Video sumber tidak kompatibel dengan encoder saat ini.\nCoba kirim video MP4 lain.' : error?.stage && /composite|static/i.test(String(error.stage)) ? 'Animasi quotes gagal digabungkan ke video.\nCoba lagi dengan video yang lebih singkat.' : 'Video quotes belum berhasil dibuat. Silakan coba lagi.')
    await m.reply(publicMessage)
    return { status: false }
  } finally {
    busyChats.delete(chatKey)
  }
}

handler.command = /^quotesvideo$/i
handler.help = ['quotesvideo']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Membuat video quotes aesthetic dengan background blur, typing animation, tanggal otomatis, dengan branding Usanagi Umi AI.'
handler.usage = '.quotesvideo HEADING | QUOTE (kirim atau reply video)'
handler.example = '.quotesvideo GOOD VIBES | Tetap berjalan meski pelan.'
handler.limit = true
handler.premiumOnly = false

export default handler
