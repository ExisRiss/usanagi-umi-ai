/* Umi Usanagi AI — Paket Fitur Umi (kode orisinal) */

const MAX_BYTES = 95 * 1024 * 1024
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36'

const TYPE_EXT = {
  'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif',
  'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov',
  'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'audio/wav': 'wav', 'audio/mp4': 'm4a',
  'application/pdf': 'pdf', 'application/zip': 'zip',
}

/** Tolak alamat privat/loopback — fitur ini mengambil URL dari pengguna. */
function assertPublicUrl(raw) {
  let url
  try {
    url = new URL(raw)
  } catch {
    throw new Error('URL tidak valid.')
  }
  if (!/^https?:$/.test(url.protocol)) throw new Error('Hanya URL http/https yang didukung.')
  const host = url.hostname.toLowerCase()
  if (
    host === 'localhost' || host.endsWith('.local') || host === '::1' ||
    /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(host) || /^169\.254\./.test(host)
  ) {
    throw new Error('URL ke alamat privat/loopback tidak diizinkan.')
  }
  return url
}

function fileNameFor(url, contentType) {
  const fromPath = decodeURIComponent(url.pathname.split('/').filter(Boolean).pop() || '')
  if (fromPath && /\.[a-z0-9]{2,5}$/i.test(fromPath)) return fromPath.slice(0, 80)
  const ext = TYPE_EXT[String(contentType || '').split(';')[0].trim()] || 'bin'
  return `umi-grab.${ext}`
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return m.reply(
      `📥 *UMI GRAB — Umi Usanagi AI*\n\nUnduh berkas dari tautan langsung lalu kirim ke chat ini.\n\nContoh:\n${usedPrefix + command} https://contoh.com/video.mp4\n${usedPrefix + command} https://contoh.com/foto.jpg\n\nBatas ukuran: 95 MB.`,
    )
  }

  let url
  try {
    url = assertPublicUrl(text.trim().split(/\s+/)[0])
  } catch (error) {
    return m.reply(`❌ ${error.message}`)
  }

  await m.react?.('⏳').catch(() => {})
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      headers: { 'User-Agent': UA, Accept: '*/*' },
      signal: AbortSignal.timeout(60000),
    })
    if (!res.ok) throw new Error(`Sumber membalas HTTP ${res.status}.`)

    const declared = Number(res.headers.get('content-length') || 0)
    if (declared > MAX_BYTES) throw new Error('Ukuran berkas melebihi 95 MB.')

    const buffer = Buffer.from(await res.arrayBuffer())
    if (!buffer.length) throw new Error('Sumber mengirim berkas kosong.')
    if (buffer.length > MAX_BYTES) throw new Error('Ukuran berkas melebihi 95 MB.')

    const contentType = res.headers.get('content-type') || ''
    const name = fileNameFor(url, contentType)
    const caption = `📥 *${name}*\n${(buffer.length / 1024 / 1024).toFixed(2)} MB · ${contentType.split(';')[0] || '-'}\n\n_Umi Grab — Umi Usanagi AI_`

    await conn.sendFile(m.chat, buffer, name, caption, m)
    await m.react?.('✅').catch(() => {})
  } catch (error) {
    await m.react?.('❌').catch(() => {})
    return m.reply(`❌ Gagal mengunduh: ${String(error?.message || error).slice(0, 160)}`)
  }
}

handler.help = ['umigrab <url>']
handler.tags = ['downloader']
handler.category = 'downloader'
handler.command = /^(umigrab|grabmedia|ambimedia)$/i
handler.description = 'Unduh berkas dari tautan langsung (Umi Usanagi AI)'

export default handler
