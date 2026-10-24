
import axios from 'axios'
import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@rexxhayanasi/elaina-baileys'

function buildCarouselButton(button = {}) {
  const type = String(button.type || 'quick_reply').toLowerCase()

  if (type === 'cta_url') {
    return {
      name: 'cta_url',
      buttonParamsJson: JSON.stringify({
        display_text: button.text || '🌐 Buka Link',
        url: button.url || '',
        merchant_url: button.merchantUrl || button.url || ''
      })
    }
  }

  if (type === 'cta_copy') {
    return {
      name: 'cta_copy',
      buttonParamsJson: JSON.stringify({
        display_text: button.text || '📋 Salin',
        id: button.id || 'copy_code',
        copy_code: String(button.copyCode || '')
      })
    }
  }

  return {
    name: 'quick_reply',
    buttonParamsJson: JSON.stringify({
      display_text: button.text || 'Pilih',
      id: button.id || ''
    })
  }
}

async function prepareCarouselMedia(conn, imageSource) {
  if (!imageSource) throw new Error('Setiap card carousel wajib memiliki image')

  let image

  if (Buffer.isBuffer(imageSource)) {
    image = imageSource
  } else if (typeof imageSource === 'string') {
    const { data } = await axios.get(imageSource, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxContentLength: 12 * 1024 * 1024,
      maxBodyLength: 12 * 1024 * 1024,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/jpeg,image/png,*/*;q=0.8',
        Referer: 'https://www.pinterest.com/'
      },
      validateStatus: status => status >= 200 && status < 400
    })
    image = Buffer.from(data)
  } else if (imageSource && typeof imageSource.url === 'string') {
    const { data } = await axios.get(imageSource.url, {
      responseType: 'arraybuffer',
      timeout: 15000,
      maxContentLength: 12 * 1024 * 1024,
      maxBodyLength: 12 * 1024 * 1024,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/133.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/jpeg,image/png,*/*;q=0.8',
        Referer: 'https://www.pinterest.com/'
      },
      validateStatus: status => status >= 200 && status < 400
    })
    image = Buffer.from(data)
  } else {
    throw new Error('image carousel harus Buffer, URL, atau { url }')
  }

  if (!image?.length) throw new Error('Gambar carousel kosong')

  return prepareWAMessageMedia(
    { image },
    { upload: conn.waUploadToServer }
  )
}

function buildContextInfo(quoted, extra = {}) {
  const contextInfo = { ...extra }

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
  const nodes = []
  if (!String(jid || '').endsWith('@g.us')) {
    nodes.push({
      tag: 'bot',
      attrs: { biz_bot: '1' }
    })
  }
  nodes.push({
    tag: 'biz',
    attrs: {},
    content: [
      {
        tag: 'interactive',
        attrs: { type: 'native_flow', v: '1' },
        content: [{ tag: 'native_flow', attrs: { v: '9', name: 'mixed' } }]
      }
    ]
  })
  return nodes
}

export async function sendCarousel(
  conn,
  jid,
  {
    text = '',
    footer = '',
    cards = [],
    quoted,
    contextInfo: extra = {}
  } = {}
) {
  if (!Array.isArray(cards) || cards.length < 2) {
    throw new Error('Carousel minimal membutuhkan 2 card')
  }

  const prepared = new Array(cards.length)
  let cursor = 0
  const workers = Math.min(4, cards.length)

  const worker = async () => {
    while (true) {
      const index = cursor++
      if (index >= cards.length) return
      const card = cards[index]
      try {
        const media = await prepareCarouselMedia(conn, card.image)
        const buttons = (card.buttons || []).map(buildCarouselButton)
        if (!buttons.length || !media?.imageMessage) continue
        prepared[index] = proto.Message.InteractiveMessage.fromObject({
          header: proto.Message.InteractiveMessage.Header.fromObject({
            title: card.title || '',
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          }),
          body: proto.Message.InteractiveMessage.Body.fromObject({
            text: card.body || ''
          }),
          footer: proto.Message.InteractiveMessage.Footer.fromObject({
            text: card.footer || ''
          }),
          nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
            buttons,
            messageParamsJson: '',
            messageVersion: 1
          })
        })
      } catch {}
    }
  }

  await Promise.all(Array.from({ length: workers }, worker))
  const carouselCards = prepared.filter(Boolean)

  if (carouselCards.length < 2) {
    throw new Error('Tidak cukup gambar yang dapat diproses untuk carousel')
  }

  const contextInfo = buildContextInfo(quoted, extra)
  const interactiveMsg = proto.Message.InteractiveMessage.fromObject({
    body: { text },
    footer: { text: footer },
    header: {
      title: '',
      subtitle: '',
      hasMediaAttachment: false
    },
    carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({
      cards: carouselCards,
      messageVersion: 1,
      carouselCardType: 1
    }),
    ...(Object.keys(contextInfo).length ? { contextInfo } : {})
  })

  const generatedMessage = generateWAMessageFromContent(
    jid,
    {
      viewOnceMessage: {
        message: {
          messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2
          },
          interactiveMessage: interactiveMsg
        }
      }
    },
    {
      quoted,
      userJid: conn.user?.id || jid
    }
  )

  return conn.relayMessage(jid, generatedMessage.message, {
    messageId: generatedMessage.key.id,
    additionalNodes: buildAdditionalNodes(jid)
  })
}

export default { sendCarousel }
