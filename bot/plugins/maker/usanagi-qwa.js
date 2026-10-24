/* By AlzRiss - Usanagi Umi AI */

import axios from 'axios'
import { resolvePhoneNumber } from '../../lib/awang-cekakses.js'

function messageText(message) {
  return String(
    message?.text || message?.caption || message?.body ||
    message?.message?.conversation || message?.message?.extendedTextMessage?.text || ''
  ).trim()
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  const source = m.quoted || m
  const quote = messageText(source) || String(text || '').trim()
  if (!quote) return m.reply(`Reply pesan atau tulis teks.\n\nContoh: ${usedPrefix}${command} Halo dunia`)
  await m.react?.('⏳')
  try {
    const sender = source.sender || m.sender
    const phone = await resolvePhoneNumber(sender, conn).catch(() => String(sender).split('@')[0])
    const avatar = await conn.profilePictureUrl(sender, 'image').catch(() => 'https://i.ibb.co/3Fh9V6p/avatar-contact.png')
    const response = await axios.post('https://qwa.eeq.my.id/api/generate', {
      sender_name: `~ ${source.pushName || m.pushName || 'User'}`,
      sender_number: `+${phone}`,
      sender_avatar: avatar,
      message: quote.slice(0, 3000),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Makassar' }).replace(':', '.'),
      background: false,
    }, {
      timeout: 30000,
      responseType: 'arraybuffer',
      headers: { 'Content-Type': 'application/json' },
    })
    await conn.sendMessage(m.chat, {
      image: Buffer.from(response.data),
      caption: 'By AlzRiss - Usanagi Umi AI',
    }, { quoted: m.raw })
    await m.react?.('✅')
  } catch (error) {
    console.error('[QWA]', error.message)
    await m.react?.('❌')
    return m.reply(`Gagal membuat quote WhatsApp: ${error.message}`)
  }
}

handler.command = /^(qwa|quotewa|fakeqwa)$/i
handler.help = ['qwa <teks/reply>']
handler.tags = ['maker']
handler.limit = true
handler.description = 'Membuat gambar quote bergaya WhatsApp'

export default handler
