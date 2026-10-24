
import { getAccessModeState } from '../../core/awang-mode.js'
import { setOnlyPcActive } from '../../core/awang-pc.js'

function getModeLabel(state) {
  if (state.onlypc) return 'ONLY PRIVATE'
  if (state.onlygc) return 'ONLY GROUP'
  return 'NORMAL'
}

function getAccessRows(state) {
  return [
    `│ Group   : *${state.onlypc ? 'BLOCKED' : 'ALLOWED'}*`,
    `│ Private : *${state.onlygc ? 'BLOCKED' : 'ALLOWED'}*`,
  ]
}

function buildStatus(state, action = null) {
  const lines = [
    '╭─「 USANAGI • ONLYPC 」',
    '│',
    `│ Mode    : *${getModeLabel(state)}*`,
    ...getAccessRows(state),
  ]

  if (action) {
    lines.push('│')
    lines.push(`│ Status  : *${action.status}*`)
    if (action.from) lines.push(`│ From    : *${action.from}*`)
    if (action.to) lines.push(`│ To      : *${action.to}*`)
  } else {
    lines.push('│')
    lines.push(state.onlygc
      ? '│ ONLY GROUP sedang membatasi command.'
      : state.onlypc
        ? '│ ONLY PRIVATE sedang membatasi command.'
        : '│ Bot berjalan dalam akses normal.')
  }

  lines.push('╰──────────────\n')
  return lines.join('\n')
}

function buildUsage(usedPrefix) {
  return [
    '',
    '╭─「 CONTROL 」',
    `│ Aktifkan : *${usedPrefix}onlypc on*`,
    `│ Matikan  : *${usedPrefix}onlypc off*`,
    '╰──────────────',
  ].join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  const mode = String(m.args[0] || '').trim().toLowerCase()
  const current = getAccessModeState()

  if (mode !== 'on' && mode !== 'off') {
    await conn.sendMessage(m.chat, {
      text: buildStatus(current) + buildUsage(usedPrefix),
    }, { quoted: m.raw })
    return
  }

  if (mode === 'on') {
    const switched = current.onlygc
    const state = setOnlyPcActive(true)
    const action = switched
      ? { status: 'ENABLED', from: 'ONLY GROUP', to: 'ONLY PRIVATE' }
      : { status: 'ENABLED', to: 'ONLY PRIVATE' }
    await conn.sendMessage(m.chat, { text: buildStatus(state, action) }, { quoted: m.raw })
    return
  }

  const wasActive = current.onlypc
  const state = setOnlyPcActive(false)
  const action = wasActive
    ? { status: 'DISABLED', from: 'ONLY PRIVATE', to: getModeLabel(state) }
    : { status: 'ALREADY OFF', to: getModeLabel(state) }
  await conn.sendMessage(m.chat, { text: buildStatus(state, action) }, { quoted: m.raw })
}

handler.command = /^onlypc$/i
handler.help = ['onlypc']
handler.tags = ['owner']
handler.description = 'Membatasi penggunaan bot hanya di private chat'
handler.ownerOnly = true
handler.accessModeControl = true

export default handler
