/*
❀ fitur : payment 
❀ cara pakai : .addpay nama payment trus reply foto atau url image contoh .addpay dana|085523568687, buat tampilkan payment comand nya .pay, buat liat list paymen .listpay , buat delete payment .delpay nama payment contoh .delpay dana 
❀ note : sesuain sama SC kalian
 * By AlzRiss - Usanagi Umi AI
*/

import { existsSync, mkdirSync, writeFileSync } from 'fs'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { proto, generateWAMessageContent, generateWAMessageFromContent } from '@rexxhayanasi/elaina-baileys'

const handler = async (m, { conn, text, command, usedPrefix }) => {

  let chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
  chat.payments = chat.payments || {}

  if (command === 'addpay') {
    if (!text) throw `Format salah!\nContoh:\n${usedPrefix}addpay Dana|085523568687\n${usedPrefix}addpay Dana|085523568687|https://url-gambar.jpg\n\nAtau reply foto lalu ketik:\n${usedPrefix}addpay Dana|085523568687`

    const parts = text.split('|').map(s => s.trim())
    if (parts.length < 2) throw `Format salah!\nContoh: ${usedPrefix}addpay Dana|085523568687`

    const name = parts[0]
    const number = parts[1]
    let imageUrl = parts[2] || null

    if (Object.keys(chat.payments).length >= 10 && !chat.payments[name.toLowerCase()]) {
      throw `❌ Maksimal 10 payment per grup!\nHapus salah satu dulu dengan ${usedPrefix}delpay <nama>`
    }

    if (!imageUrl && m.quoted) {
      try {
        const q = m.quoted
        const mime = (q.msg || q).mimetype || ''
        if (/image/.test(mime)) {
          const dir = './media/payment'
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true })

          const buffer = await q.download()
          const filename = `${Date.now()}.jpg`
          const filepath = join(dir, filename)

          writeFileSync(filepath, buffer)
          imageUrl = filepath
        }
      } catch (e) {
        console.error('[addpay] gagal simpan foto:', e)
      }
    }

    const key = name.toLowerCase()
    chat.payments[key] = {
      title: name,
      number,
      image: imageUrl || null
    }

    return m.reply(`✅ Berhasil menambahkan payment *${name}*\nNomor: ${number}${imageUrl ? '\nGambar: ✓' : '\nGambar: ✗ (pakai default)'}`)
  }

  if (command === 'delpay') {
    if (!text) throw `Contoh:\n${usedPrefix}delpay Dana`

    const key = text.trim().toLowerCase()
    if (!chat.payments[key]) throw `Payment *${text}* tidak ditemukan`

    delete chat.payments[key]
    return m.reply(`🗑️ Berhasil menghapus payment *${text}*`)
  }

  if (command === 'listpay') {
    const entries = Object.values(chat.payments)
    if (!entries.length) throw `Belum ada payment yang ditambahkan!\nGunakan: ${usedPrefix}addpay Nama|Nomor`

    let teks = '❀ *LIST PAYMENT*\n\n'
    teks += entries.map((v, i) => `${i + 1}. *${v.title}*\n    └ \`${v.number}\`${v.image ? ' ❀' : ''}`).join('\n')
    teks += `\n\n❀ Total: ${entries.length}/10`

    return m.reply(teks)
  }

  if (command === 'pay') {
    const entries = Object.values(chat.payments)
    if (!entries.length) throw `Belum ada payment yang ditambahkan!\nGunakan: ${usedPrefix}addpay Nama|Nomor`

    const DEFAULT_IMAGE = 'https://cdn.nekohime.site/file/jg13261q.jpeg'

    async function createImage(urlOrPath) {
      const isLocal = urlOrPath.startsWith('./') || urlOrPath.startsWith('/')
      const { imageMessage } = await generateWAMessageContent(
        { image: { url: isLocal ? pathToFileURL(urlOrPath).href : urlOrPath } },
        { upload: conn.waUploadToServer }
      )
      return imageMessage
    }

    const cards = []

    for (const pay of entries) {
      const imgUrl = pay.image || DEFAULT_IMAGE
      cards.push({
        body: proto.Message.InteractiveMessage.Body.fromObject({
          text: `*${pay.title}*\n\nNomor:\n\`\`\`${pay.number}\`\`\``
        }),
        footer: proto.Message.InteractiveMessage.Footer.fromObject({
          text: '❀ Tap tombol untuk salin nomor'
        }),
        header: proto.Message.InteractiveMessage.Header.fromObject({
          title: pay.title,
          hasMediaAttachment: true,
          imageMessage: await createImage(imgUrl)
        }),
        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
          buttons: [
            {
              name: 'cta_copy',
              buttonParamsJson: JSON.stringify({
                display_text: '📋 Salin Nomor',
                copy_code: pay.number
              })
            }
          ]
        })
      })
    }

    const msg = generateWAMessageFromContent(m.chat, {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: proto.Message.InteractiveMessage.fromObject({
            body: proto.Message.InteractiveMessage.Body.create({
              text: '*❀ PAYMENT INFO*\n\nGeser kartu untuk pilih metode pembayaran.'
            }),
            footer: proto.Message.InteractiveMessage.Footer.create({
              text: '❀ Payment'
            }),
            header: proto.Message.InteractiveMessage.Header.create({
              hasMediaAttachment: false
            }),
            carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
              cards
            })
          })
        }
      }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
  }

}

handler.help = ['pay', 'addpay', 'delpay', 'listpay']
handler.tags = ['store']
handler.command = /^(pay|addpay|delpay|listpay)$/i
handler.group = true
handler.owner = true

export default handler