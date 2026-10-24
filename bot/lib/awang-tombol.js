/* By AlzRiss - Usanagi Umi AI */

import fs from 'fs-extra'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import crypto from 'crypto'
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
  proto,
} from '@rexxhayanasi/elaina-baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSET_IMAGE_DIR = path.join(__dirname, '..', 'assets', 'image')

function toQuickReplyButton(btn) {
  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: btn.label,
      id: btn.command || btn.id || `noop_${crypto.randomUUID()}`,
    }),
  }
}

function toUrlButton(btn) {
  return {
    name: 'cta_url',
    buttonParamsJson: JSON.stringify({
      display_text: btn.label,
      url: btn.url,
      merchant_url: btn.merchantUrl || btn.url,
    }),
  }
}

function toCopyButton(btn) {
  return {
    name: 'cta_copy',
    buttonParamsJson: JSON.stringify({
      display_text: btn.label,
      id: btn.id || crypto.randomUUID(),
      copy_code: btn.copyCode || '',
    }),
  }
}

function toRawNativeButton(btn) {
  if (!btn?.name) throw new TypeError('Raw native button requires a name')
  return {
    name: btn.name,
    buttonParamsJson: typeof btn.paramsJson === 'string' ? btn.paramsJson : JSON.stringify(btn.params || {}),
  }
}

function toListButton({ listTitle = 'Pilih Menu', sections = [] }) {
  return {
    name: 'single_select',
    buttonParamsJson: JSON.stringify({
      title: listTitle,
      sections: sections.map((section) => ({
        title: section.title,
        ...(section.highlightLabel ? { highlight_label: section.highlightLabel } : {}),
        rows: section.rows.map((row) => ({
          header: row.header || '',
          title: row.title,
          description: row.description || '',
          id: row.command,
        })),
      })),
    }),
  }
}

async function resolveImageBuffer(image) {
  if (!image) return null

  let rawBuffer

  if (Buffer.isBuffer(image)) {
    rawBuffer = image
  } else if (/^https?:\/\//i.test(image)) {
    return null
  } else {
    const localPath = path.isAbsolute(image) ? image : path.join(ASSET_IMAGE_DIR, image)
    if (!(await fs.pathExists(localPath))) return null
    rawBuffer = await fs.readFile(localPath)
  }

  try {
    return await sharp(rawBuffer)
      .resize({ width: 1024, withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer()
  } catch {
    return rawBuffer
  }
}

function isImageUrl(image) {
  return typeof image === 'string' && /^https?:\/\//i.test(image)
}

async function resolveDocumentBuffer(document) {
  if (!document) return null
  if (Buffer.isBuffer(document)) return document
  if (/^https?:\/\//i.test(document)) return null
  const localPath = path.isAbsolute(document) ? document : path.resolve(document)
  if (!(await fs.pathExists(localPath))) return null
  try {
    return await fs.readFile(localPath)
  } catch {
    return null
  }
}

async function resolveVideoBuffer(video) {
  if (!video) return null
  if (Buffer.isBuffer(video)) return video
  if (/^https?:\/\//i.test(video)) return null
  const localPath = path.isAbsolute(video) ? video : path.resolve(video)
  if (!(await fs.pathExists(localPath))) return null
  try {
    return await fs.readFile(localPath)
  } catch {
    return null
  }
}

function buildContextInfo({ mentions = [], quoted, extra = {} } = {}) {
  const contextInfo = { ...extra }

  if (mentions.length) {
    contextInfo.mentionedJid = mentions
  }

  if (quoted?.key && quoted?.message) {
    contextInfo.stanzaId = quoted.key.id
    contextInfo.participant = quoted.key.participant || quoted.key.remoteJid
    contextInfo.quotedMessage = quoted.message
    contextInfo.remoteJid = quoted.key.remoteJid
    contextInfo.fromMe = Boolean(quoted.key.fromMe)
  }

  return contextInfo
}

function buildAdditionalNodes(jid) {
  const isGroup = jid.endsWith('@g.us')

  const interactiveNode = {
    tag: 'biz',
    attrs: {},
    content: [
      {
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
      },
    ],
  }

  return [interactiveNode]
}

async function relayGenerated(conn, jid, content, sendOptions = {}) {
  const messageContent = content?.interactiveMessage
    ? {
        viewOnceMessage: {
          message: {
            messageContextInfo: {
              deviceListMetadata: {},
              deviceListMetadataVersion: 2,
            },
            interactiveMessage: content.interactiveMessage,
          },
        },
      }
    : content

  const generatedMessage = generateWAMessageFromContent(jid, messageContent, {
    userJid: conn.user.id,
    quoted: sendOptions.quoted,
  })

  return conn.relayMessage(jid, generatedMessage.message, {
    messageId: generatedMessage.key.id,
    additionalNodes: buildAdditionalNodes(jid),
  })
}

async function sendStyleV1(conn, jid, options, sendOptions) {
  const { title = '', subtitle = '', body = '', footer = '', image, video, gifPlayback = false, document, documentFileName = 'Usanagi-Ai', documentMimetype = 'application/octet-stream', documentThumbnail, buttons = [], list, mentions = [] } = options

  const nativeButtons = [
    ...(list ? [toListButton(list)] : []),
    ...buttons.map((button) => {
      if (button.type === 'url') return toUrlButton(button)
      if (button.type === 'copy') return toCopyButton(button)
      if (button.type === 'noop') return toQuickReplyButton(button)
      if (button.type === 'raw') return toRawNativeButton(button)
      return toQuickReplyButton(button)
    }),
    ...(options.urlButtons || []).map(toUrlButton),
    ...(options.rawButtons || []).map(toRawNativeButton),
  ]

  const urlMode = isImageUrl(image)
  const imageBuffer = urlMode ? null : await resolveImageBuffer(image)
  const videoBuffer = await resolveVideoBuffer(video)
  const documentBuffer = await resolveDocumentBuffer(document)
  let headerMedia = {}

  if (videoBuffer) {
    headerMedia = await prepareWAMessageMedia(
      { video: videoBuffer, gifPlayback: Boolean(gifPlayback) },
      { upload: conn.waUploadToServer }
    )
  } else if (documentBuffer) {
    const preparedDocument = await prepareWAMessageMedia(
      { document: documentBuffer, mimetype: documentMimetype, fileName: documentFileName },
      { upload: conn.waUploadToServer }
    )
    const documentMessage = preparedDocument?.documentMessage
    if (documentMessage) {
      documentMessage.mimetype = documentMimetype
      documentMessage.fileName = documentFileName
      const thumbnailBuffer = await resolveImageBuffer(documentThumbnail || image)
      if (thumbnailBuffer) {
        documentMessage.jpegThumbnail = await sharp(thumbnailBuffer)
          .resize(300, 300, { fit: 'inside', withoutEnlargement: true, position: 'centre' })
          .jpeg({ quality: 68, chromaSubsampling: '4:2:0', mozjpeg: true })
          .toBuffer()
      }
      headerMedia = preparedDocument
    }
  } else if (imageBuffer) {
    headerMedia = await prepareWAMessageMedia({ image: imageBuffer }, { upload: conn.waUploadToServer })
  }

  const contextInfo = buildContextInfo({
    mentions,
    quoted: sendOptions.quoted,
    extra: urlMode
      ? {
          externalAdReply: {
            title,
            body: footer.slice(0, 60),
            thumbnailUrl: image,
            mediaType: 1,
            renderLargerThumbnail: false,
          },
        }
      : {},
  })

  return relayGenerated(conn, jid, {
    interactiveMessage: proto.Message.InteractiveMessage.create({
      header: proto.Message.InteractiveMessage.Header.create({
        title,
        subtitle,
        hasMediaAttachment: Boolean(imageBuffer || videoBuffer || headerMedia?.documentMessage || headerMedia?.imageMessage || headerMedia?.videoMessage),
        ...headerMedia,
      }),
      body: proto.Message.InteractiveMessage.Body.create({ text: body }),
      footer: proto.Message.InteractiveMessage.Footer.create({ text: footer }),
      contextInfo,
      nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
        buttons: nativeButtons,
        messageParamsJson: '{}',
      }),
    }),
  }, sendOptions)
}

export async function sendInteractive(conn, jid, options = {}, sendOptions = {}) {
  try {
    return await sendStyleV1(conn, jid, options, sendOptions)
  } catch (err) {
    console.log(`  \x1b[31m✗\x1b[0m  Gagal kirim menu: ${err?.message || err}`)
    if (options.fallbackToText === false) throw err
    if (options.image) {
      try {
        const imageBuffer = await resolveImageBuffer(options.image)
        if (imageBuffer?.length) {
          const caption = [options.title, options.subtitle, options.body].map((value) => String(value || '').trim()).filter(Boolean).join('\n')
          return await conn.sendMessage(
            jid,
            { image: imageBuffer, caption, mentions: options.mentions || [] },
            sendOptions
          )
        }
      } catch (imageFallbackError) {
        console.log(`  \x1b[31m✗\x1b[0m  Fallback gambar gagal: ${imageFallbackError?.message || imageFallbackError}`)
      }
    }
    try {
      return await conn.sendMessage(
        jid,
        { text: options.body || options.footer || options.title || '', mentions: options.mentions || [] },
        sendOptions
      )
    } catch (fallbackError) {
      console.log(`  \x1b[31m✗\x1b[0m  Fallback kirim menu gagal: ${fallbackError?.message || fallbackError}`)
      throw fallbackError
    }
  }
}

class BaseBuilder {
  constructor() {
    this._title = ''
    this._subtitle = ''
    this._body = ''
    this._footer = ''
    this._contextInfo = {}
    this._extraPayload = {}
  }

  setTitle(title) {
    if (typeof title !== 'string') throw new TypeError('Title must be a string')
    this._title = title
    return this
  }

  setSubtitle(subtitle) {
    if (typeof subtitle !== 'string') throw new TypeError('Subtitle must be a string')
    this._subtitle = subtitle
    return this
  }

  setBody(body) {
    if (typeof body !== 'string') throw new TypeError('Body must be a string')
    this._body = body
    return this
  }

  setFooter(footer) {
    if (typeof footer !== 'string') throw new TypeError('Footer must be a string')
    this._footer = footer
    return this
  }

  setContextInfo(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('ContextInfo must be a plain object')
    }
    this._contextInfo = obj
    return this
  }

  addPayload(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('Payload must be a plain object')
    }
    Object.assign(this._extraPayload, obj)
    return this
  }

  static async resize(buffer, x, y, fit = 'cover') {
    return await sharp(buffer)
      .resize(x, y, {
        fit,
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()
  }

  static async fetchBuffer(url, options = {}, config = {}) {
    try {
      let response = await fetch(url, options)
      if (!response.ok) throw Error(`HTTP ${response.status}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      if (config.silent) return Buffer.alloc(0)
      throw error
    }
  }
}

class ButtonV2 extends BaseBuilder {
  #client

  constructor(client) {
    super()
    if (!client) throw new Error('Socket is required')
    this.#client = client
    this._image
    this._data
    this._buttons = []
  }

  addButton(displayText = '', buttonId = crypto.randomUUID()) {
    this._buttons.push({
      buttonId,
      buttonText: { displayText },
      type: 1,
    })
    return this
  }

  addRawButton(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('Buttons must be a plain object')
    }
    this._buttons.push(obj)
    return this
  }

  setThumbnail(path) {
    if (!path) throw new Error('Url or buffer needed')
    this._image = path
    return this
  }

  setMedia(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      throw new TypeError('Media must be a plain object')
    }
    this._data = obj
    return this
  }

  async build(jid, { ...options } = {}) {
    let _thumbnail = this._image
      ? await BaseBuilder.resize(
          Buffer.isBuffer(this._image)
            ? this._image
            : await BaseBuilder.fetchBuffer(this._image, {}, { silent: true }),
          300,
          300
        )
      : null

    const msg = generateWAMessageFromContent(
      jid,
      {
        ...this._extraPayload,
        buttonsMessage: {
          contentText: this._body,
          footerText: this._footer,
          ...(this._data
            ? this._data
            : {
                headerType: 6,
                locationMessage: {
                  degreesLatitude: 0,
                  degreesLongitude: 0,
                  name: this._title,
                  address: this._subtitle,
                  jpegThumbnail: _thumbnail,
                  contextInfo: this._contextInfo,
                },
              }),
          viewOnce: true,
          contextInfo: this._contextInfo,
          buttons: [...this._buttons],
        },
      },
      { ...options }
    )
    return msg
  }

  async send(jid, { ...options } = {}) {
    if (this._buttons.length < 1) throw new Error('ButtonV2 requires at least one button')
    const msg = await this.build(jid, options)

    await this.#client.relayMessage(msg.key.remoteJid, msg.message, {
      messageId: msg.key.id,
      additionalNodes: [
        {
          tag: 'biz',
          attrs: {},
          content: [
            {
              tag: 'interactive',
              attrs: { type: 'native_flow', v: '1' },
              content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }],
            },
          ],
        },
      ],
      ...options,
    })
    return msg
  }
}

export { ButtonV2 }

export default { sendInteractive }