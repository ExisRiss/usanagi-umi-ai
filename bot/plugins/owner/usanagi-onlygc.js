
import { getAccessModeState } from '../../core/awang-mode.js'
import { setOnlyGcActive } from '../../core/awang-gc.js'
import { saveJadibotConfig } from '../../lib/bot-config.js'

function getModeLabel(state) {
  if (state.onlygc) return 'ONLY GROUP'
  if (state.onlypc) return 'ONLY PRIVATE'
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
    '╭─「 USANAGI • ONLYGC 」',
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
    `│ Aktifkan : *${usedPrefix}onlygc on*`,
    `│ Matikan  : *${usedPrefix}onlygc off*`,
    '╰──────────────',
  ].join('\n')
}

const handler = async (m, { conn, usedPrefix }) => {
  const mode = String(m.args[0] || '').trim().toLowerCase()
  const profile = conn?.botConfig

  if (profile?.type === 'jadibot') {
    const current = { mode: profile.onlyGroup ? 'onlygc' : 'normal', onlygc: profile.onlyGroup === true, onlypc: false }
    if (mode !== 'on' && mode !== 'off') {
      await conn.sendMessage(m.chat, { text: buildStatus(current) + buildUsage(usedPrefix) }, { quoted: m.raw })
      return
    }
    const wasActive = profile.onlyGroup === true
    profile.onlyGroup = mode === 'on'
    saveJadibotConfig(profile)
    const state = { mode: profile.onlyGroup ? 'onlygc' : 'normal', onlygc: profile.onlyGroup, onlypc: false }
    const action = profile.onlyGroup
      ? { status: wasActive ? 'ALREADY ON' : 'ENABLED', to: 'ONLY GROUP' }
      : { status: wasActive ? 'DISABLED' : 'ALREADY OFF', from: wasActive ? 'ONLY GROUP' : undefined, to: 'NORMAL' }
    await conn.sendMessage(m.chat, { text: buildStatus(state, action) }, { quoted: m.raw })
    return
  }

  const current = getAccessModeState()

  if (mode !== 'on' && mode !== 'off') {
    await conn.sendMessage(m.chat, {
      text: buildStatus(current) + buildUsage(usedPrefix),
    }, { quoted: m.raw })
    return
  }

  if (mode === 'on') {
    const switched = current.onlypc
    const state = setOnlyGcActive(true)
    const action = switched
      ? { status: 'ENABLED', from: 'ONLY PRIVATE', to: 'ONLY GROUP' }
      : { status: 'ENABLED', to: 'ONLY GROUP' }
    await conn.sendMessage(m.chat, { text: buildStatus(state, action) }, { quoted: m.raw })
    return
  }

  const wasActive = current.onlygc
  const state = setOnlyGcActive(false)
  const action = wasActive
    ? { status: 'DISABLED', from: 'ONLY GROUP', to: getModeLabel(state) }
    : { status: 'ALREADY OFF', to: getModeLabel(state) }
  await conn.sendMessage(m.chat, { text: buildStatus(state, action) }, { quoted: m.raw })
}

handler.command = /^onlygc$/i
handler.help = ['onlygc']
handler.tags = ['owner']
handler.description = 'Membatasi penggunaan bot hanya di group'
handler.ownerOnly = true
handler.accessModeControl = true

export default handler
