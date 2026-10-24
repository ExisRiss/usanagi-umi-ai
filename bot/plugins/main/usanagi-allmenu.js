
import fs from 'fs'
import { prepareWAMessageMedia } from '@rexxhayanasi/elaina-baileys'
import { settings } from '../../config/settings.js'
import { buildFullMenuText, getGreeting, resolveMenuMention } from '../../lib/awang-menu.js'
import { ButtonV2 } from '../../lib/awang-tombol.js'
import { readMenuMedia } from '../../lib/menu-media.js'

const handler = async (m, { conn, usedPrefix }) => {
  const mention = await resolveMenuMention(m, conn)
  const subtitle = `${getGreeting()} ${mention.text}`
  const fullText = buildFullMenuText({ prefix: usedPrefix })

  const button = new ButtonV2(conn)
    .setTitle(settings.botName)
    .setSubtitle(subtitle)
    .setContextInfo({ mentionedJid: mention.jid ? [mention.jid] : [] })
    .setBody(' ') .setFooter(fullText) 

  const menuMedia = readMenuMedia(conn)
  const preparedMedia = await prepareWAMessageMedia(
    menuMedia.type === 'image'
      ? { image: menuMedia.data, mimetype: menuMedia.mimetype }
      : { video: menuMedia.data, mimetype: menuMedia.mimetype, gifPlayback: true },
    { upload: conn.waUploadToServer }
  )
  if (preparedMedia.imageMessage) button.setMedia({ headerType: 4, imageMessage: preparedMedia.imageMessage })
  if (preparedMedia.videoMessage) button.setMedia({ headerType: 5, videoMessage: preparedMedia.videoMessage })

  button.addButton('⌂ MENU UTAMA', `${usedPrefix}menu`)

  await button.send(m.chat, { quoted: m.raw })
}

handler.command = /^allmenu$/i
handler.help = ['allmenu']
handler.tags = ['main']
handler.description = 'Menampilkan seluruh menu dalam satu tampilan lengkap'

export default handler