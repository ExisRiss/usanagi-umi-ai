
import fs from 'fs'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'
import { settings } from '../../config/settings.js'
import { buildMenuFooter, buildCategoryList, getGreeting, resolveMenuMention } from '../../lib/awang-menu.js'
import { ButtonV2 } from '../../lib/awang-tombol.js'
import { isOwner, resolvePhoneNumber } from '../../lib/awang-cekakses.js'
import { getUser } from '../../core/awang-userdb.js'
import { creatorWatermark } from '../../core/awang-identitas.js'
import { getMenuStyle } from '../../core/awang-menu-config.js'
import { sendModernMenu, buildFullMenuText } from '../../lib/awang-menu.js'
import { readMenuMedia } from '../../lib/menu-media.js'

const handler = async (m, { conn, usedPrefix }) => {
  if (getMenuStyle() === 'modern') {
    await sendModernMenu(conn, m, usedPrefix)
    return
  }
  const mention = await resolveMenuMention(m, conn)
  const subtitle = `${getGreeting()} ${mention.text}`
  const isOwnerUser = await isOwner(m.sender, conn)
  const user = await getUser(m.sender)
  const contactNumber = await resolvePhoneNumber(m.sender, conn)


  const footerLong = buildMenuFooter({
    prefix: usedPrefix,
    pushName: m.pushName,
    contactNumber,
    isOwnerUser,
    registeredAt: user?.registeredAt,
  }) + '\n\n' + creatorWatermark()


  // WhatsApp menolak (406 not-acceptable) daftar pilihan yang terlalu panjang.
  // Batasi ke 5 bagian dan 10 baris total; sisanya tetap bisa dijelajahi lewat
  // baris "Semua Fitur" (.allmenu).
  const rawSections = buildCategoryList({ prefix: usedPrefix }).sections
  let rowBudget = 10
  const sections = []
  for (const section of rawSections) {
    if (rowBudget <= 0 || sections.length >= 5) break
    const rows = section.rows.slice(0, rowBudget).map((row) => ({
      header: row.header || '',
      title: row.title,
      description: row.description || '',
      id: row.command,
    }))
    if (!rows.length) continue
    rowBudget -= rows.length
    sections.push({
      title: section.title,
      highlight_label: section.highlightLabel || '',
      rows,
    })
  }

  const button = new ButtonV2(conn)
    .setTitle(settings.botName)
    .setSubtitle(subtitle)
    .setContextInfo({ mentionedJid: mention.jid ? [mention.jid] : [] })
    .setBody(' ') .setFooter(footerLong)

  const menuMedia = readMenuMedia(conn)
  const preparedMedia = await prepareWAMessageMedia(
    menuMedia.type === 'image'
      ? { image: menuMedia.data, mimetype: menuMedia.mimetype }
      : { video: menuMedia.data, mimetype: menuMedia.mimetype },
    { upload: conn.waUploadToServer }
  )
  if (preparedMedia.imageMessage) button.setMedia({ headerType: 4, imageMessage: preparedMedia.imageMessage })
  if (preparedMedia.videoMessage) button.setMedia({ headerType: 5, videoMessage: preparedMedia.videoMessage })

  button.addButton('♕ OWNER BOT', `${usedPrefix}owner`)

  button.addRawButton({
    buttonText: { displayText: '☰ LIST MENU' },
    buttonId: 'menu',
    type: 1,
    nativeFlowInfo: {
      name: 'single_select',
      paramsJson: JSON.stringify({
        title: `${settings.botName} Menu`,
        sections: sections,
      }),
    },
  })

  try {
    await button.send(m.chat, { quoted: m.raw })
  } catch (error) {
    // Payload tombol interaktif bisa ditolak WhatsApp (406 not-acceptable) pada
    // sebagian akun/chat. Menu versi teks selalu bisa dikirim, jadi perintah
    // .menu tidak boleh ikut gagal.
    console.warn(`[MENU] tombol interaktif ditolak (${error.message}); mengirim menu teks.`)
    await conn.sendMessage(m.chat, {
      text: buildFullMenuText({
        prefix: usedPrefix,
        pushName: m.pushName,
        contactNumber,
        isOwnerUser,
        registeredAt: user?.registeredAt,
      }),
    }, { quoted: m.raw })
  }
}

handler.command = /^menu$/i
handler.help = ['menu']
handler.tags = ['main']
handler.description = 'Menampilkan menu utama bot'

export default handler