
import { isOwner } from '../../lib/awang-cekakses.js'
import { isGroupAdmin } from '../../lib/awang-aksesgrub.js'
import { getAntiLinkStatus, setAntiLinkGcMode, setAntiLinkChMode } from '../../core/awang-link.js'
import { sendInteractive } from '../../lib/awang-tombol.js'

const MODE_3X = '3x'
const MODE_24H = '24h'
const MODE_DELETE = 'delete'

const MODE_LABELS = {
  [MODE_3X]: 'AntiLinkGC 3x',
  [MODE_24H]: 'AntiLinkGC 1x / 24 JAM',
  [MODE_DELETE]: 'AntiLinkGC DELETE ONLY',
}

const normalizeMode = (value) => {
  const mode = String(value || '').toLowerCase()
  if (mode === MODE_3X || mode === '3' || mode === '3x') return MODE_3X
  if (mode === MODE_24H || mode === '1x24' || mode === '24jam' || mode === '1x/24jam') return MODE_24H
  if (mode === MODE_DELETE || mode === 'deleteonly' || mode === 'delete-only' || mode === 'only') return MODE_DELETE
  return null
}

function getCurrentMode(status) {
  return status?.gc ? normalizeMode(status.gcMode) || MODE_3X : null
}

function modeDescription(mode) {
  if (mode === MODE_3X) return 'Hapus + warning maksimal 3x, lalu kick.'
  if (mode === MODE_24H) return '1 link pertama/24 jam diizinkan.'
  return 'Hapus link saja; tanpa warning dan kick.'
}

function buildMenuText(status) {
  const activeMode = getCurrentMode(status)
  return [
    '🔐 *ANTILINKGC*',
    '',
    `Status : *${activeMode ? `AKTIF — ${MODE_LABELS[activeMode]}` : 'NONAKTIF'}*`,
    '',
    'Pilih satu mode untuk mengatur grup.',
  ].join('\n')
}

function buildMenu(status) {
  const activeMode = getCurrentMode(status)
  const activateRows = [MODE_3X, MODE_24H, MODE_DELETE].map((mode) => ({
    title: `${activeMode === mode ? '✅ ' : ''}${MODE_LABELS[mode]}`,
    description: modeDescription(mode),
    command: `.antilinkgc set ${mode}`,
  }))
  const deactivateRows = [MODE_3X, MODE_24H, MODE_DELETE].map((mode) => ({
    title: `OFF — ${MODE_LABELS[mode]}`,
    description: activeMode === mode ? 'Matikan mode yang sedang aktif.' : 'Mode ini tidak sedang aktif.',
    command: `.antilinkgc off ${mode}`,
  }))

  return {
    title: '------------',
    subtitle: 'Proteksi link grup WhatsApp',
    body: buildMenuText(status),
    footer: 'Satu mode aktif untuk per group.',
    list: {
      listTitle: 'Pilih Pengaturan',
      sections: [
        {
          title: 'AKTIFKAN ANTILINKGC',
          rows: activateRows,
        },
        {
          title: 'NONAKTIFKAN ANTILINKGC',
          rows: deactivateRows,
        },
      ],
    },
  }
}

function buildStatusText(status) {
  const activeMode = getCurrentMode(status)
  if (!activeMode) {
    return [
      '╭─〔 ANTILINKGC 〕',
      '│',
      '│ Status : *NONAKTIF*',
      '╰──────────────',
    ].join('\n')
  }

  return [
    '╭─〔 ANTILINKGC 〕',
    '│',
    '│ Status : *AKTIF*',
    `│ Mode   : *${MODE_LABELS[activeMode]}*`,
    `│ ${modeDescription(activeMode)}`,
    '╰──────────────',
  ].join('\n')
}

async function sendInfo(m, text) {
  await m.reply(text, { originalMessage: m.raw })
}

async function showMenu(m, conn) {
  const status = getAntiLinkStatus(m.chat)
  await sendInteractive(conn, m.chat, buildMenu(status), { quoted: m.raw })
}


const CHANNEL_MODE_LABELS = {
  [MODE_3X]: 'AntiLinkCH 3x',
  [MODE_24H]: 'AntiLinkCH 1x / 24 JAM',
  [MODE_DELETE]: 'AntiLinkCH DELETE ONLY',
}

function channelModeDescription(mode) {
  if (mode === MODE_3X) return 'Hapus + warning maksimal 3x, lalu kick.'
  if (mode === MODE_24H) return '1 link pertama/24 jam diizinkan.'
  return 'Hapus link saja; tanpa warning dan kick.'
}

function getCurrentChannelMode(status) {
  return status?.ch ? normalizeMode(status.chMode) || MODE_3X : null
}

function buildChannelMenuText(status) {
  const activeMode = getCurrentChannelMode(status)
  return [
    '🔗 *ANTILINKCH*',
    '',
    `Status : *${activeMode ? `AKTIF — ${CHANNEL_MODE_LABELS[activeMode]}` : 'NONAKTIF'}*`,
    '',
    'Proteksi link saluran WhatsApp.',
  ].join('\n')
}

function buildChannelMenu(status) {
  const activeMode = getCurrentChannelMode(status)
  const activateRows = [MODE_3X, MODE_24H, MODE_DELETE].map((mode) => ({
    title: `${activeMode === mode ? '✅ ' : ''}${CHANNEL_MODE_LABELS[mode]}`,
    description: channelModeDescription(mode),
    command: `.antilinkch set ${mode}`,
  }))
  const deactivateRows = [MODE_3X, MODE_24H, MODE_DELETE].map((mode) => ({
    title: `OFF — ${CHANNEL_MODE_LABELS[mode]}`,
    description: activeMode === mode ? 'Matikan mode yang sedang aktif.' : 'Mode ini tidak sedang aktif.',
    command: `.antilinkch off ${mode}`,
  }))

  return {
    title: '------------',
    subtitle: 'Proteksi link saluran WhatsApp',
    body: buildChannelMenuText(status),
    footer: 'Satu mode aktif untuk per group.',
    list: {
      listTitle: 'Pilih Pengaturan',
      sections: [
        {
          title: 'AKTIFKAN ANTILINKCH',
          rows: activateRows,
        },
        {
          title: 'NONAKTIFKAN ANTILINKCH',
          rows: deactivateRows,
        },
      ],
    },
  }
}

function buildChannelStatusText(status) {
  const activeMode = getCurrentChannelMode(status)
  if (!activeMode) {
    return [
      '╭─〔 ANTILINKCH 〕',
      '│',
      '│ Status : *NONAKTIF*',
      '╰──────────────',
    ].join('\n')
  }

  return [
    '╭─〔 ANTILINKCH 〕',
    '│',
    '│ Status : *AKTIF*',
    `│ Mode   : *${CHANNEL_MODE_LABELS[activeMode]}*`,
    `│ ${channelModeDescription(activeMode)}`,
    '╰──────────────',
  ].join('\n')
}

async function showChannelMenu(m, conn) {
  const status = getAntiLinkStatus(m.chat)
  await sendInteractive(conn, m.chat, buildChannelMenu(status), { quoted: m.raw })
}

const handler = async (m, { conn, usedPrefix }) => {
  if (!m.isGroup) {
    await conn.sendMessage(m.chat, { text: 'Fitur anti-link hanya dapat digunakan di dalam group.' }, { quoted: m.raw })
    return
  }

  const owner = await isOwner(m.sender, conn)
  const admin = owner || await isGroupAdmin(conn, m.chat, m.sender)
  if (!admin) {
    await conn.sendMessage(m.chat, { text: 'Perintah ini hanya dapat diatur oleh owner bot atau admin group.' }, { quoted: m.raw })
    return
  }

  const command = String(m.command || '').toLowerCase()
  if (command === 'antilinkch') {
    const action = String(m.args?.[0] || '').toLowerCase()
    const value = String(m.args?.[1] || '').toLowerCase()
    const current = getAntiLinkStatus(m.chat)
    const currentMode = getCurrentChannelMode(current)

    if (!action) {
      await showChannelMenu(m, conn)
      return
    }

    if (action === 'status') {
      await sendInfo(m, buildChannelStatusText(current))
      return
    }

    if (['on', 'aktif', 'enable'].includes(action)) {
      const status = setAntiLinkChMode(m.chat, MODE_3X)
      await sendInfo(m, [
        '✅ *ANTILINKCH AKTIF*',
        '',
        `Mode : *${CHANNEL_MODE_LABELS[getCurrentChannelMode(status)]}*`,
        channelModeDescription(getCurrentChannelMode(status)),
        '',
        'Mode lain otomatis nonaktif.',
      ].join('\n'))
      return
    }

    if (action === 'set') {
      const mode = normalizeMode(value)
      if (!mode) {
        await sendInfo(m, `Mode tidak valid.\n\nGunakan ${usedPrefix}antilinkch untuk membuka menu.`)
        return
      }
      const status = setAntiLinkChMode(m.chat, mode)
      await sendInfo(m, [
        '✅ *ANTILINKCH AKTIF*',
        '',
        `Mode : *${CHANNEL_MODE_LABELS[getCurrentChannelMode(status)]}*`,
        channelModeDescription(getCurrentChannelMode(status)),
        '',
        'Mode lain otomatis nonaktif.',
      ].join('\n'))
      return
    }

    if (['off', 'mati', 'disable'].includes(action) && !value) {
      if (!currentMode) {
        await sendInfo(m, 'ℹ️ *ANTILINKCH SUDAH NONAKTIF*\n\nTidak ada mode yang sedang aktif.')
        return
      }
      const status = setAntiLinkChMode(m.chat, null)
      await sendInfo(m, getCurrentChannelMode(status) ? `ℹ️ Mode aktif : *${CHANNEL_MODE_LABELS[getCurrentChannelMode(status)]}*.` : '✅ *ANTILINKCH NONAKTIF*')
      return
    }

    if (action === 'off') {
      const selectedMode = normalizeMode(value)
      if (!selectedMode) {
        await sendInfo(m, `Mode OFF tidak valid.\n\nGunakan ${usedPrefix}antilinkch untuk membuka menu.`)
        return
      }
      if (!currentMode) {
        await sendInfo(m, 'ℹ️ Tidak ada mode AntiLinkCH yang sedang aktif pada group ini.')
        return
      }
      if (selectedMode !== currentMode) {
        await sendInfo(m, [
          'ℹ️ *MODE TIDAK AKTIF*',
          '',
          `Mode aktif : *${CHANNEL_MODE_LABELS[currentMode]}*`,
        ].join('\n'))
        return
      }
      const status = setAntiLinkChMode(m.chat, null)
      await sendInfo(m, getCurrentChannelMode(status) ? `ℹ️ Mode aktif : *${CHANNEL_MODE_LABELS[getCurrentChannelMode(status)]}*.` : '✅ *ANTILINKCH NONAKTIF*')
      return
    }

    await showChannelMenu(m, conn)
    return
  }

  const action = String(m.args?.[0] || '').toLowerCase()
  const value = String(m.args?.[1] || '').toLowerCase()
  const current = getAntiLinkStatus(m.chat)
  const currentMode = getCurrentMode(current)

  if (!action) {
    await showMenu(m, conn)
    return
  }

  if (action === 'status') {
    await sendInfo(m, buildStatusText(current))
    return
  }

  if (['on', 'aktif', 'enable'].includes(action)) {
    const status = setAntiLinkGcMode(m.chat, MODE_3X)
    await sendInfo(m, [
      '✅ *ANTILINKGC AKTIF*',
      '',
      `Mode : *${MODE_LABELS[getCurrentMode(status)]}*`,
      modeDescription(getCurrentMode(status)),
      '',
      'Mode lain otomatis nonaktif.',
    ].join('\n'))
    return
  }

  if (['off', 'mati', 'disable'].includes(action) && !value) {
    if (!currentMode) {
      await sendInfo(m, 'ℹ️ *ANTILINKGC SUDAH NONAKTIF*\n\nTidak ada mode yang sedang aktif.')
      return
    }
    const status = setAntiLinkGcMode(m.chat, null)
    await sendInfo(
      m,
      getCurrentMode(status)
        ? `ℹ️ Mode aktif : *${MODE_LABELS[getCurrentMode(status)]}*.`
        : '✅ *ANTILINKGC NONAKTIF*'
    )
    return
  }

  if (action === 'set') {
    const mode = normalizeMode(value)
    if (!mode) {
      await sendInfo(m, `Mode tidak valid.\n\nGunakan ${usedPrefix}antilinkgc untuk membuka menu.`)
      return
    }
    const status = setAntiLinkGcMode(m.chat, mode)
    await sendInfo(
      m,
      [
        '✅ *ANTILINKGC AKTIF*',
        '',
        `Mode : *${MODE_LABELS[getCurrentMode(status)]}*`,
        modeDescription(getCurrentMode(status)),
        '',
        'Mode lain otomatis nonaktif.',
      ].join('\n')
    )
    return
  }

  if (action === 'off') {
    const selectedMode = normalizeMode(value)
    if (!selectedMode) {
      await sendInfo(m, `Mode OFF tidak valid.\n\nGunakan ${usedPrefix}antilinkgc untuk membuka menu.`)
      return
    }
    if (!currentMode) {
      await sendInfo(m, 'ℹ️ Tidak ada mode AntiLinkGC yang sedang aktif pada group ini.')
      return
    }
    if (selectedMode !== currentMode) {
      await sendInfo(
        m,
        [
          'ℹ️ *MODE TIDAK AKTIF*',
          '',
          `Mode aktif : *${MODE_LABELS[currentMode]}*`,
        ].join('\n')
      )
      return
    }
    const status = setAntiLinkGcMode(m.chat, null)
    await sendInfo(
      m,
      getCurrentMode(status)
        ? `ℹ️ Mode aktif : *${MODE_LABELS[getCurrentMode(status)]}*.`
        : '✅ *ANTILINKGC NONAKTIF*'
    )
    return
  }

  await showMenu(m, conn)
}

handler.command = /^(antilinkgc|antilinkch)$/i
handler.help = ['antilinkgc', 'antilinkch']
handler.menuHelp = ['antilinkgc', 'antilinkch']
handler.tags = ['group']
handler.category = 'group'
handler.description = 'Mengatur anti-link group dan saluran WhatsApp'
handler.groupOnly = true

export default handler
