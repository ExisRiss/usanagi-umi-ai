
import { sendInteractive } from '../../lib/awang-tombol.js'
import { uploaders, mimeLookup } from '../../lib/scraper/awang-uploaders.js'
import { downloadMediaBuffer, getMediaSource, getFileName, getMimeType, getExtensionFromMime, react } from '../../lib/awang-media.js'

const handler = async (m, { rawConn, settings, usedPrefix }) => {
  const source = getMediaSource(m, ['image', 'video', 'audio', 'sticker', 'document'])
  if (!source) {
    await m.reply(`💬 Reply atau kirim media lalu ketik *${usedPrefix}tourl*.`)
    return
  }

  await react(rawConn, m, '🕕')
  try {
    const buffer = await downloadMediaBuffer(source)
    const mime = getMimeType(source, 'application/octet-stream')
    const filename = getFileName(source, `file.${getExtensionFromMime(mime)}`)
    const results = []
    const failed = []
    const skipped = []

    for (const uploader of uploaders) {
      if (uploader.optional && !process.env.USANAGI_TERMAI_KEY) {
        skipped.push(`${uploader.name}: key belum diset`)
        continue
      }
      try {
        results.push(await uploader.fn(buffer, filename))
      } catch {
        failed.push(uploader.name)
      }
    }

    if (!results.length) {
      await react(rawConn, m, '❌')
      return m.reply(`❌ Upload gagal. Berhasil: *0* • Gagal: *${failed.length}* • Dilewati: *${skipped.length}*`)
    }

    const sizeLabel = buffer.length >= 1024 * 1024
      ? `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`
      : `${Math.max(1, Math.round(buffer.length / 1024))} KB`
    const mimeLabel = mime.split(';')[0].trim() || 'application/octet-stream'
    const attempted = results.length + failed.length + skipped.length
    const recommendedIndex = results.findIndex((item) => String(item.expires || '').toLowerCase() === 'permanen')
    const lines = [
      '✅ *TOURL SELESAI*',
      `📦 ${mimeLabel} • ${sizeLabel}`,
      `📊 ${results.length} berhasil • ${failed.length} gagal • ${skipped.length} dilewati`,
      ''
    ]

    results.slice(0, 5).forEach((item, index) => {
      const expiry = String(item.expires || 'Tidak diketahui').trim() || 'Tidak diketahui'
      const permanent = expiry.toLowerCase() === 'permanen'
      const status = permanent ? 'PERMANEN' : `TERBATAS • ${expiry.toUpperCase()}`
      const recommendation = index === recommendedIndex ? ' • REKOMENDASI' : ''
      lines.push(`${index + 1}. *${item.host}* — ${status}${recommendation}`)
    })

    if (results.length > 5) lines.push(`+ ${results.length - 5} link lainnya tersedia`)
    lines.push('', `Server: ${attempted} diperiksa`)

    const body = lines.join('\n')
    const buttons = results.slice(0, 5).map((item, index) => ({
      type: 'copy',
      label: `SALIN ${index + 1} • ${item.host}${index === recommendedIndex ? ' • REKOMENDASI' : ''}`,
      id: `tourl_${index}`,
      copyCode: item.url,
    }))

    try {
      await sendInteractive(rawConn, m.chat, {
        title: 'TOURL',
        body,
        footer: settings.botName || 'Usanagi Umi AI',
        buttons,
      }, { quoted: m.raw })
    } catch {
      await rawConn.sendMessage(m.chat, { text: body }, { quoted: m.raw })
    }

    await react(rawConn, m, '✅')
    return { status: true }
  } catch (error) {
    await react(rawConn, m, '❌')
    throw new Error(`Tourl gagal: ${error?.message || 'proses tidak tersedia'}`)
  }
}

handler.command = /^(tourl|upload|catbox|url)$/i
handler.help = ['tourl', 'upload', 'catbox', 'url']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Upload media ke berbagai host dan mendapatkan URL.'
handler.usage = '.tourl (reply/kirim media)'
handler.example = '.tourl'
handler.limit = false
handler.premiumOnly = false

export default handler
