
import { sendInteractive } from '../../lib/awang-tombol.js'
import {
  extractQuotedText,
  formatDateId,
  formatNumber,
  makeNewsletterLink,
  normalizeNewsletterMetadata,
  parseNewsletterInput,
  resolveProfileImage,
} from '../../lib/awang-id.js'

const PLACEHOLDER = 'channel-placeholder.svg'

function helpText(prefix) {
  return `💬 Kirim/reply link channel lalu ketik *${prefix}cekidch*.`
}

function buildBody(metadata, timezone) {
  const rows = [
    `👥 Pengikut: ${metadata.subscribers === null ? 'Tidak tersedia' : formatNumber(metadata.subscribers)}`,
    `✅ Verifikasi: ${metadata.verification}`,
    `🖼️ Profil: ${metadata.hasPicture ? 'Tersedia' : 'Belum tersedia'}`,
  ]

  if (metadata.creationTime) rows.push(`📅 Dibuat: ${formatDateId(metadata.creationTime, timezone)}`)
  return rows.join('\n')
}

function react(rawConn, chat, key, text) {
  if (!rawConn?.sendMessage || !key) return
  void rawConn.sendMessage(chat, { react: { text, key } }).catch(() => {})
}

const handler = async (m, { conn, rawConn, usedPrefix, settings }) => {
  const directInput = String(m.args?.join(' ') || '').trim()
  const quotedInput = extractQuotedText(m)
  const rawInput = directInput || quotedInput
  const parsed = parseNewsletterInput(rawInput)

  if (!parsed) {
    await m.reply(helpText(usedPrefix))
    return
  }

  react(rawConn, m.chat, m.raw?.key, '⏳')

  try {
    if (typeof conn.newsletterMetadata !== 'function') {
      throw new Error('Koneksi WhatsApp ini tidak menyediakan pembacaan metadata saluran.')
    }

    const metadataRaw = await conn.newsletterMetadata(parsed.type, parsed.value)
    const metadata = normalizeNewsletterMetadata(metadataRaw, parsed.type === 'jid' ? parsed.value : '')

    if (!metadata.id || !metadata.id.endsWith('@newsletter')) {
      throw new Error('ID saluran tidak ditemukan pada metadata WhatsApp.')
    }

    const image = await resolveProfileImage(
      conn,
      metadata.id,
      metadata.pictureUrl,
      metadata.pictureDirectPath,
      metadata.previewUrl,
      metadata.previewDirectPath,
    )
    metadata.hasPicture = Boolean(image)
    const displayImage = image || PLACEHOLDER
    const link = makeNewsletterLink(metadata, rawInput)
    const buttons = [
      {
        type: 'copy',
        label: 'SALIN ID SALURAN',
        id: `copy_${metadata.id}`,
        copyCode: metadata.id,
      },
    ]

    if (link) {
      buttons.push({
        type: 'url',
        label: 'BUKA SALURAN',
        url: link,
      })
    }

    await sendInteractive(
      conn,
      m.chat,
      {
        title: 'CEKIDCH',
        subtitle: 'CHANNEL',
        body: buildBody(metadata, settings?.timezone || 'Asia/Jakarta'),
        footer: 'Usanagi • Channel Identifier',
        image: displayImage,
        buttons,
      },
      { quoted: m.raw }
    )

    react(rawConn, m.chat, m.raw?.key, '✅')
  } catch (err) {
    react(rawConn, m.chat, m.raw?.key, '⚠️')
    await m.reply('❌ Channel tidak dapat dibaca. Cek link/JID lalu coba lagi.')
  }
}

handler.command = /^cekidch$/i
handler.help = ['cekidch']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengecek ID dan metadata WhatsApp Channel'

export default handler
