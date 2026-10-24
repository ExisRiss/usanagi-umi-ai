/* By AlzRiss - Usanagi Umi AI */

import crypto from 'node:crypto'

const makeRichTableMessageId = () => `3EB0${crypto.randomBytes(18).toString('hex').toUpperCase()}`

const buildRichTableContext = (quoted) => {
  const contextInfo = {
    forwardingScore: 1,
    isForwarded: true,
    forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
    forwardOrigin: 4,
  }

  if (quoted?.key) {
    contextInfo.stanzaId = quoted.key.id
    contextInfo.participant = quoted.key.participant || quoted.sender || quoted.key.remoteJid
    contextInfo.quotedMessage = quoted.message
  }

  return contextInfo
}

const sendNativeTableV1 = async (conn, jid, title, headers, rows, quoted, options = {}) => {
  if (!conn?.relayMessage) throw new TypeError('Connection relayMessage tidak tersedia')

  const tableRows = [
    { items: headers.map(value => String(value ?? '')), isHeading: true },
    ...rows.map(row => ({ items: (Array.isArray(row) ? row : [row]).map(value => String(value ?? '')) })),
  ]

  const submessages = []
  if (options.headerText) submessages.push({ messageType: 2, messageText: String(options.headerText) })
  submessages.push({ messageType: 4, tableMetadata: { title: String(title), rows: tableRows } })
  if (options.footer) submessages.push({ messageType: 2, messageText: String(options.footer) })

  const messageId = makeRichTableMessageId()
  const message = {
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages,
          contextInfo: buildRichTableContext(quoted),
        },
      },
    },
  }

  await conn.relayMessage(jid, message, { messageId })
  return { message, messageId }
}


export { sendNativeTableV1 }
export const sendNativeRichTable = sendNativeTableV1

export default { sendNativeTableV1, sendNativeRichTable }

function normalizeCellLegacy(value) {
  return String(value ?? '')
}

function normalizeRowsLegacy(headers, rows) {
  const maxLen = Math.max(
    headers.length,
    ...rows.map((row) => Array.isArray(row) ? row.length : 0),
  )

  const normalize = (row) => [
    ...(Array.isArray(row) ? row : [row]),
    ...Array(Math.max(0, maxLen - (Array.isArray(row) ? row.length : 1))).fill(''),
  ].map(normalizeCellLegacy)

  const normalizedHeaders = normalize(headers)

  const unifiedRows = [
    {
      is_header: true,
      cells: normalizedHeaders,
    },
    ...rows.map((row) => ({
      is_header: false,
      cells: normalize(row),
    })),
  ]

  return {
    rows: unifiedRows.map((row) => ({
      items: row.cells,
      ...(row.is_header ? { isHeading: true } : {}),
    })),
    unifiedRows,
  }
}

function buildSectionLegacy(data) {
  return {
    view_model: {
      primitive: data,
      __typename: 'GenAISingleLayoutViewModel',
    },
  }
}

function buildTextPrimitiveLegacy(text, type = 'GenAIMetadataTextPrimitive') {
  return buildSectionLegacy({
    text: String(text),
    __typename: type,
  })
}

function buildTablePrimitiveLegacy(unifiedRows) {
  return buildSectionLegacy({
    rows: unifiedRows,
    __typename: 'GenATableUXPrimitive',
  })
}

function buildContextInfoLegacy(quoted) {
  if (!quoted) return {}

  const key = quoted?.key || {}

  return {
    stanzaId: key.id || quoted?.id,
    participant: key.participant || key.remoteJid || quoted?.participant,
    quotedType: 0,
    quotedMessage: quoted?.message ?? quoted,
  }
}

export function buildNativeRichTable({
  title = '',
  headers = [],
  rows = [],
  headerText = '',
  footer = '',
  quoted = null,
  botJid = '867051314767696@bot',
  responseId = crypto.randomUUID(),
} = {}) {
  if (!Array.isArray(headers) || !headers.length) {
    throw new TypeError('Headers harus berupa array yang tidak kosong')
  }

  if (!Array.isArray(rows)) {
    throw new TypeError('Rows harus berupa array')
  }

  const normalizedHeaders = headers.map(normalizeCellLegacy)
  const normalizedRows = rows.map((row) => (
    Array.isArray(row) ? row.map(normalizeCellLegacy) : [normalizeCellLegacy(row)]
  ))

  const table = normalizeRowsLegacy(normalizedHeaders, normalizedRows)

  const sections = [
    ...(headerText ? [buildTextPrimitiveLegacy(headerText, 'GenAIMarkdownTextUXPrimitive')] : []),
    buildTablePrimitiveLegacy(table.unifiedRows),
    ...(footer ? [buildTextPrimitiveLegacy(footer)] : []),
  ]

  return {
    messageContextInfo: {
      deviceListMetadata: {},
      deviceListMetadataVersion: 2,
      botMetadata: {
        messageDisclaimerText: String(title),
        botResponseId: responseId,
        richResponseSourcesMetadata: {
          sources: [],
        },
      },
    },
    botForwardedMessage: {
      message: {
        richResponseMessage: {
          messageType: 1,
          submessages: [
            ...(headerText
              ? [{
                  messageType: 2,
                  messageText: String(headerText),
                }]
              : []),
            {
              messageType: 4,
              tableMetadata: {
                title: String(title),
                rows: table.rows,
              },
            },
          ],
          unifiedResponse: {
            data: Buffer.from(
              JSON.stringify({
                response_id: responseId,
                sections,
              })
            ).toString('base64'),
          },
          contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedAiBotMessageInfo: {
              botJid,
            },
            forwardOrigin: 4,
            ...buildContextInfoLegacy(quoted),
          },
        },
      },
    },
  }
}

export async function sendNativeRichTableLegacy(
  conn,
  jid,
  title,
  headers,
  rows,
  quoted = null,
  options = {},
) {
  if (!conn?.relayMessage) {
    throw new TypeError('Connection relayMessage tidak tersedia')
  }

  const responseId = options.responseId || crypto.randomUUID()
  const message = buildNativeRichTable({
    title,
    headers,
    rows,
    headerText: options.headerText || '',
    footer: options.footer || '',
    quoted,
    botJid: options.botJid || '867051314767696@bot',
    responseId,
  })

  return conn.relayMessage(jid, message, { messageId: responseId })
}

