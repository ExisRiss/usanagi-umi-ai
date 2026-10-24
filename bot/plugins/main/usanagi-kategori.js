
import { settings } from '../../config/settings.js'
import { buildCategoryText, getGreeting, resolveMenuMention } from '../../lib/awang-menu.js'
import { getPluginsByCategory } from '../../core/awang-loader.js'
import { ButtonV2 } from '../../lib/awang-tombol.js'

const MAX_TEXT_CHUNK = 3500

function splitCategoryText(value, maxLength = MAX_TEXT_CHUNK) {
  const lines = String(value || '').split('\n')
  const chunks = []
  let current = ''

  for (const sourceLine of lines) {
    let line = sourceLine
    while (line.length > maxLength) {
      if (current) {
        chunks.push(current)
        current = ''
      }
      chunks.push(line.slice(0, maxLength))
      line = line.slice(maxLength)
    }

    const candidate = current ? `${current}\n${line}` : line
    if (candidate.length > maxLength) {
      if (current) chunks.push(current)
      current = line
    } else {
      current = candidate
    }
  }

  if (current) chunks.push(current)
  return chunks.filter(Boolean)
}

const handler = async (m, { conn, usedPrefix }) => {
  const mention = await resolveMenuMention(m, conn)
  const subtitle = `${getGreeting()} ${mention.text}`
  const categoryKey = String(m.args[0] || '').trim().toLowerCase()
  const plugins = getPluginsByCategory(categoryKey)

  if (!categoryKey || !plugins.length) {
    await conn.sendMessage(
      m.chat,
      { text: `Kategori tidak ditemukan. Ketik ${usedPrefix}menu untuk melihat daftar kategori yang tersedia.` },
      { quoted: m.raw }
    )
    return
  }

  const categoryText = buildCategoryText(categoryKey, { prefix: usedPrefix })
  const chunks = splitCategoryText(categoryText)

  // Detail kategori sebelumnya ditempatkan di footer ButtonV2. Footer WhatsApp
  // memiliki batas jauh lebih kecil, sehingga kategori besar berhenti tanpa respons.
  // Kirim sebagai pesan teks bertahap agar semua kategori selalu terkirim utuh.
  for (let index = 0; index < chunks.length; index += 1) {
    await conn.sendMessage(
      m.chat,
      {
        text: chunks[index],
        mentions: mention.jid ? [mention.jid] : [],
      },
      index === 0 ? { quoted: m.raw } : {}
    )
  }

  // Tombol navigasi hanya pelengkap. Kegagalannya tidak boleh menggagalkan
  // detail kategori yang sudah terkirim.
  try {
    const button = new ButtonV2(conn)
      .setTitle(settings.botName)
      .setSubtitle(subtitle)
      .setContextInfo({ mentionedJid: mention.jid ? [mention.jid] : [] })
      .setBody(`Kategori ${categoryKey} berhasil dimuat • ${plugins.length} plugin`)
      .setFooter('By AlzRiss - Usanagi Umi AI')

    button.addButton('❀ SEMUA MENU', `${usedPrefix}allmenu`)
    button.addButton('☰ PILIH KATEGORI', `${usedPrefix}menu`)
    await button.send(m.chat, { quoted: m.raw })
  } catch (error) {
    console.warn(`[MENU-KATEGORI] Navigasi ${categoryKey} gagal dikirim: ${error.message}`)
  }
}

handler.command = /^(kategori|listmenu)$/i
handler.help = ['kategori', 'listmenu']
handler.tags = ['main']
handler.description = 'Menampilkan detail fitur dalam satu kategori'

export default handler
