/* By AlzRiss - Usanagi Umi AI */

import { sendInteractive } from '../../lib/awang-tombol.js'
import {
  extractQuotedText,
  formatDateId,
  formatNumber,
  makeGroupLink,
  normalizeGroupMetadata,
  parseGroupInput,
  resolveProfileImage,
} from '../../lib/awang-id.js'

const PLACEHOLDER = 'channel-placeholder.svg'

function helpText(prefix) {
  return `💬 Kirim/reply link group lalu ketik *${prefix}cekidgc*.`
}

function buildBody(metadata, timezone) {
  const rows = [
    `👥 Anggota: ${formatNumber(metadata.memberCount)}`,
    `🖼️ Profil: ${metadata.hasPicture ? 'Tersedia' : 'Belum tersedia'}`,
  ]

  if (metadata.creation) rows.push(`📅 Dibuat: ${formatDateId(metadata.creation, timezone)}`)
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
  const parsed = parseGroupInput(rawInput)

  if (!parsed) {
    await m.reply(helpText(usedPrefix))
    return
  }

  react(rawConn, m.chat, m.raw?.key, '⏳')

  try {
    let metadataRaw
    let groupId
    let inviteLink = ''

    if (parsed.type === 'jid') {
      groupId = parsed.value
      metadataRaw = await conn.groupMetadata(groupId)
    } else {
      if (typeof conn.groupGetInviteInfo !== 'function') {
        throw new Error('Koneksi WhatsApp ini tidak menyediakan pencarian group dari link.')
      }
      metadataRaw = await conn.groupGetInviteInfo(parsed.value)
      groupId = metadataRaw?.id || metadataRaw?.jid || ''
      inviteLink = makeGroupLink(parsed.value)
    }

    const metadata = normalizeGroupMetadata(metadataRaw, groupId)
    if (!metadata.id || !metadata.id.endsWith('@g.us')) {
      throw new Error('ID group tidak ditemukan pada metadata WhatsApp.')
    }

    const image = await resolveProfileImage(conn, metadata.id)
    metadata.hasPicture = Boolean(image)
    const displayImage = image || PLACEHOLDER
    if (!inviteLink && parsed.type === 'jid' && typeof conn.groupInviteCode === 'function') {
      try {
        const code = await conn.groupInviteCode(groupId)
        inviteLink = makeGroupLink(code)
      } catch {}
    }

    const buttons = [
      {
        type: 'copy',
        label: 'SALIN ID GROUP',
        id: `copy_${metadata.id}`,
        copyCode: metadata.id,
      },
    ]

    if (inviteLink) {
      buttons.push({
        type: 'url',
        label: 'BUKA GROUP',
        url: inviteLink,
      })
    }

    await sendInteractive(
      conn,
      m.chat,
      {
        title: 'CEKIDGC',
        subtitle: 'GROUP',
        body: buildBody(metadata, settings?.timezone || 'Asia/Jakarta'),
        footer: 'Usanagi • Group Identifier',
        image: displayImage,
        buttons,
      },
      { quoted: m.raw }
    )

    react(rawConn, m.chat, m.raw?.key, '✅')
  } catch (err) {
    react(rawConn, m.chat, m.raw?.key, '⚠️')
    await m.reply('❌ Group tidak dapat dibaca. Cek link/JID lalu coba lagi.')
  }
}

handler.command = /^cekidgc$/i
handler.help = ['cekidgc']
handler.tags = ['tools']
handler.category = 'tools'
handler.description = 'Mengecek ID dan metadata WhatsApp Group'

export default handler
