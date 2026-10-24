
import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { ButtonV2 } from '../lib/awang-tombol.js'
import { creatorWatermark } from './awang-identitas.js'
import { settings } from '../config/settings.js'
import { normalizeNumber, resolvePhoneNumber } from '../lib/awang-cekakses.js'
import { touchUser } from './awang-userdb.js'
import { claimPrivateWelcome, finalizePrivateWelcome, releasePrivateWelcome } from './awang-welcome.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const IMAGE_PATH = path.join(__dirname, '..', 'assets', 'image', 'private.jpg')

const IGNORED_MESSAGE_TYPES = new Set([
  'protocolMessage',
  'reactionMessage',
  'senderKeyDistributionMessage',
  'messageContextInfo',
  'pollUpdateMessage',
])

function unwrapMessage(message) {
  let current = message

  for (let i = 0; i < 6; i++) {
    const next =
      current?.ephemeralMessage?.message ||
      current?.viewOnceMessage?.message ||
      current?.viewOnceMessageV2?.message ||
      current?.viewOnceMessageV2Extension?.message ||
      current?.documentWithCaptionMessage?.message

    if (!next || next === current) break
    current = next
  }

  return current || {}
}

function isPrivateUserChat(chat) {
  const jid = String(chat || '').trim().toLowerCase()

  if (!jid || jid === 'status@broadcast') return false

  return jid.endsWith('@s.whatsapp.net') || jid.endsWith('@lid')
}

function isUserInteraction(message) {
  const content = unwrapMessage(message)

  return Object.keys(content).some((key) => !IGNORED_MESSAGE_TYPES.has(key))
}

function safePushName(value) {
  const name = String(value || '').replace(/\s+/g, ' ').trim()

  return name || 'Kak'
}

function buildWelcomeText({ botName, pushName, phoneNumber }) {
  const identity = phoneNumber ? `@${phoneNumber}` : `*${pushName}*`

  return [
    `🤖 Halo ${identity}`,
    '',
    `Terima kasih telah menghubungi *${botName}*.`,
    'Saya siap membantu kebutuhanmu.',
    '',
    'Untuk melihat seluruh fitur yang ada,',
    'silakan tekan tombol di bawah.',
  ].join('\n')
}

async function loadWelcomeImage() {
  try {
    if (!(await fs.pathExists(IMAGE_PATH))) return null

    const source = await fs.readFile(IMAGE_PATH)

    return await sharp(source)
      .resize({
        width: 300,
        height: 300,
        fit: 'inside',
        withoutEnlargement: true,
        position: 'center',
      })
      .jpeg({
        quality: 88,
        chromaSubsampling: '4:2:0',
        mozjpeg: true,
      })
      .toBuffer()
  } catch {
    return null
  }
}

async function resolveMention(sender, conn) {
  try {
    const phoneNumber = await resolvePhoneNumber(sender, conn)

    if (phoneNumber && /^\d{7,15}$/.test(phoneNumber)) {
      return {
        phoneNumber,
        jid: `${phoneNumber}@s.whatsapp.net`,
      }
    }
  } catch {
  }

  if (String(sender || '').endsWith('@s.whatsapp.net')) {
    const number = normalizeNumber(sender)

    if (/^\d{7,15}$/.test(number)) {
      return {
        phoneNumber: number,
        jid: sender,
      }
    }
  }

  return {
    phoneNumber: '',
    jid: '',
  }
}

export async function handlePrivateWelcome(
  conn,
  raw,
  {
    chat,
    sender,
    isSelf,
    pushName,
    prefix,
    messageContent,
  } = {},
) {
  if (isSelf || !isPrivateUserChat(chat) || !sender || !raw?.message) {
    return false
  }

  if (!isUserInteraction(messageContent || raw.message)) {
    return false
  }

  await touchUser(sender, safePushName(pushName))

  const claimAt = claimPrivateWelcome(sender)

  if (!claimAt) {
    return false
  }

  try {
    const mention = await resolveMention(sender, conn)

    const body = buildWelcomeText({
      botName: settings.botName,
      pushName: safePushName(pushName),
      phoneNumber: mention.phoneNumber,
    })

    const image = await loadWelcomeImage()

    const button = new ButtonV2(conn)
      .setTitle(settings.botName)
      .setSubtitle('WhatsApp Bot pintar & multifungsi')
      .setBody(body)
      .setFooter(`\n${creatorWatermark()}`)
      .setContextInfo(
        mention.jid
          ? {
              mentionedJid: [mention.jid],
            }
          : {},
      )
      .addButton(
        'TAMPILKAN MENU BOT',
        `${prefix || settings.defaultPrefix}menu`,
      )

    if (image) {
      button.setMedia({
        headerType: 6,
        locationMessage: {
          degreesLatitude: 0,
          degreesLongitude: 0,
          name: settings.botName,
          address: 'WhatsApp Bot pintar & multifungsi',
          jpegThumbnail: image,
        },
      })
    }

    await button.send(chat, {
      quoted: raw,
    })

    finalizePrivateWelcome(sender, claimAt)

    return true
  } catch (err) {
    releasePrivateWelcome(sender, claimAt)

    console.log(
      `  \x1b[33m⚠\x1b[0m  Welcome private gagal untuk ${sender}: ${err?.message || err}`,
    )

    return false
  }
}

export default {
  handlePrivateWelcome,
}