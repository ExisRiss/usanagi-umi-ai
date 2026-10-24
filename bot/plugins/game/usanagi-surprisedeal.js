/* Aqua MD Surprise Deal — safely ported for Usanagi Umi AI */

const sessions = globalThis.__usanagiSurpriseDealSessions || new Map()
globalThis.__usanagiSurpriseDealSessions = sessions

const MAX_LEVEL = 5
const SESSION_TIMEOUT_MS = 5 * 60 * 1000
const PRIZES = [
  { name: '🎮 Console Mini', min: 1_000, max: 2_000 },
  { name: '⌚ Smartwatch', min: 1_200, max: 2_400 },
  { name: '🎧 Headset', min: 1_500, max: 3_000 },
  { name: '📱 Gadget Box', min: 1_800, max: 3_600 },
  { name: '💻 Laptop Mini', min: 2_000, max: 4_000 },
  { name: '🚲 Sepeda', min: 2_200, max: 4_400 },
]

const cleanText = value => String(value || '').trim().toLowerCase()
const sessionKey = (chat, sender) => `${chat}:${sender}`
const formatMoney = value => Math.max(0, Math.floor(Number(value) || 0)).toLocaleString('id-ID')
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function makeLevel(level) {
  const totalBoxes = Math.min(15, Math.max(3, level * 3))
  const zonkCount = Math.max(1, Math.floor(totalBoxes / 3))
  const positions = Array.from({ length: totalBoxes }, (_, index) => index)

  for (let index = positions.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1))
    ;[positions[index], positions[swap]] = [positions[swap], positions[index]]
  }

  const zonk = new Set(positions.slice(0, zonkCount))
  return Array.from({ length: totalBoxes }, (_, index) => {
    if (zonk.has(index)) return { type: 'zonk' }
    const item = PRIZES[randomInt(0, PRIZES.length - 1)]
    const multiplier = 1 + ((level - 1) * 0.45)
    return {
      type: 'prize',
      prize: {
        name: item.name,
        value: Math.round(randomInt(item.min, item.max) * multiplier),
      },
    }
  })
}

function boxGrid(total) {
  return Array.from({ length: total }, (_, index) => `〔 ${String(index + 1).padStart(2, ' ')} 〕`)
    .reduce((rows, box, index) => {
      const row = Math.floor(index / 3)
      if (!rows[row]) rows[row] = []
      rows[row].push(box)
      return rows
    }, [])
    .map(row => row.join(' '))
    .join('\n')
}

function gameInfo(session, prefix) {
  const totalBoxes = session.boxes.length
  const zonkCount = session.boxes.filter(box => box.type === 'zonk').length
  return [
    `╭─〔 🎁 SURPRISE DEAL • LEVEL ${session.level}/${MAX_LEVEL} 〕`,
    '│',
    `│ Pilih satu dari ${totalBoxes} box.`,
    `│ Risiko: sekitar ${zonkCount} box ZONK.`,
    '│',
    ...boxGrid(totalBoxes).split('\n').map(line => `│ ${line}`),
    '│',
    `│ Pilih: ${prefix}surprisedeal <nomor box>`,
    `│ Menyerah: ${prefix}surprisedeal surrender`,
    '╰────────────────',
  ].join('\n')
}

function decisionInfo(session, prefix) {
  const prize = session.pendingPrize
  return [
    '╭─〔 🎉 BOX BERHADIAH 〕',
    '│',
    `│ Hadiah : ${prize.name}`,
    `│ Nilai  : ${formatMoney(prize.value)} Money`,
    '│',
    `│ ${prefix}surprisedeal collect`,
    '│ Ambil hadiah dan akhiri permainan.',
    session.level < MAX_LEVEL
      ? `│ ${prefix}surprisedeal next`
      : '│ Level terakhir tercapai — hadiah siap diambil.',
    session.level < MAX_LEVEL
      ? '│ Ambil nilai hadiah lalu lanjut ke level berikutnya.'
      : '',
    '╰────────────────',
  ].filter(Boolean).join('\n')
}

function userRecord(sender) {
  const user = global.db?.data?.users?.[sender]
  if (!user) throw new Error('Data user belum siap. Coba ulangi beberapa saat lagi.')
  if (!Number.isFinite(Number(user.money))) user.money = 0
  return user
}

function credit(sender, amount) {
  const user = userRecord(sender)
  const safeAmount = Math.max(0, Math.floor(Number(amount) || 0))
  user.money += safeAmount
  return user.money
}

function clearSession(key) {
  const session = sessions.get(key)
  if (session?.timer) clearTimeout(session.timer)
  sessions.delete(key)
}

function touchSession(key, session, onTimeout) {
  if (session.timer) clearTimeout(session.timer)
  session.timer = setTimeout(onTimeout, SESSION_TIMEOUT_MS)
  session.timer.unref?.()
  sessions.set(key, session)
}

async function send(conn, m, text) {
  return conn.sendMessage(m.chat, { text }, { quoted: m.raw })
}

const handler = async (m, { conn, text, usedPrefix }) => {
  const prefix = String(usedPrefix || '/')
  const key = sessionKey(m.chat, m.sender)
  const input = cleanText(text)
  let session = sessions.get(key)

  if (!input) {
    if (session) {
      return send(conn, m, session.pendingPrize
        ? decisionInfo(session, prefix)
        : gameInfo(session, prefix))
    }

    session = {
      chat: m.chat,
      sender: m.sender,
      level: 1,
      boxes: makeLevel(1),
      pendingPrize: null,
      timer: null,
    }
    touchSession(key, session, async () => {
      if (!sessions.has(key)) return
      clearSession(key)
      await conn.sendMessage(m.chat, {
        text: '⌛ Surprise Deal berakhir karena tidak ada aktivitas selama 5 menit.',
      }).catch(() => {})
    })
    return send(conn, m, gameInfo(session, prefix))
  }

  if (!session) {
    return m.reply(`Belum ada permainan Surprise Deal. Gunakan ${prefix}surprisedeal untuk mulai.`)
  }

  if (input === 'status') {
    return send(conn, m, session.pendingPrize
      ? decisionInfo(session, prefix)
      : gameInfo(session, prefix))
  }

  if (['surrender', 'menyerah', 'stop', 'batal'].includes(input)) {
    const consolation = session.level * 500
    const balance = credit(m.sender, consolation)
    clearSession(key)
    return send(conn, m, [
      '🏳️ *SURPRISE DEAL DIHENTIKAN*',
      '',
      `Hadiah penghibur: +${formatMoney(consolation)} Money`,
      `Saldo sekarang: ${formatMoney(balance)} Money`,
    ].join('\n'))
  }

  if (input === 'collect') {
    if (!session.pendingPrize) return m.reply('Pilih box terlebih dahulu.')
    const prize = session.pendingPrize
    const balance = credit(m.sender, prize.value)
    clearSession(key)
    return send(conn, m, [
      '🎊 *HADIAH DIAMBIL*',
      '',
      `${prize.name}: +${formatMoney(prize.value)} Money`,
      `Saldo sekarang: ${formatMoney(balance)} Money`,
      '',
      `Main lagi: ${prefix}surprisedeal`,
    ].join('\n'))
  }

  if (input === 'next') {
    if (!session.pendingPrize) return m.reply('Pilih box terlebih dahulu.')
    if (session.level >= MAX_LEVEL) return m.reply('Ini level terakhir. Gunakan `collect` untuk mengambil hadiah.')

    const completedPrize = session.pendingPrize
    const balance = credit(m.sender, completedPrize.value)
    session.level += 1
    session.boxes = makeLevel(session.level)
    session.pendingPrize = null
    touchSession(key, session, async () => {
      if (!sessions.has(key)) return
      clearSession(key)
      await conn.sendMessage(m.chat, { text: '⌛ Surprise Deal berakhir karena tidak ada aktivitas selama 5 menit.' }).catch(() => {})
    })
    return send(conn, m, [
      `🔥 Level ${session.level - 1} selesai! +${formatMoney(completedPrize.value)} Money`,
      `💰 Saldo sekarang: ${formatMoney(balance)} Money`,
      '',
      gameInfo(session, prefix),
    ].join('\n'))
  }

  const selected = Number(input)
  if (!Number.isInteger(selected) || selected < 1 || selected > session.boxes.length) {
    return m.reply(`Pilih nomor box 1-${session.boxes.length}, atau gunakan collect/next/surrender.`)
  }
  if (session.pendingPrize) return m.reply(`Kamu sudah mendapat hadiah. Gunakan ${prefix}surprisedeal collect atau next.`)

  const box = session.boxes[selected - 1]
  if (box.type === 'zonk') {
    clearSession(key)
    return send(conn, m, [
      '💥 *ZONK!*',
      '',
      `Box ${selected} tidak berisi hadiah. Permainan selesai.`,
      `Coba lagi: ${prefix}surprisedeal`,
    ].join('\n'))
  }

  const bonus = Math.random() < 0.25
  session.pendingPrize = {
    ...box.prize,
    value: bonus ? box.prize.value * 2 : box.prize.value,
  }
  touchSession(key, session, async () => {
    if (!sessions.has(key)) return
    clearSession(key)
    await conn.sendMessage(m.chat, { text: '⌛ Surprise Deal berakhir karena tidak ada aktivitas selama 5 menit.' }).catch(() => {})
  })

  const bonusText = bonus ? '🎉 *BONUS!* Nilai hadiah digandakan.\n\n' : ''
  return send(conn, m, `${bonusText}${decisionInfo(session, prefix)}`)
}

handler.help = ['surprisedeal', 'surprisedeal <nomor/collect/next/surrender>']
handler.tags = ['game']
handler.category = 'game'
handler.description = 'Pilih box hadiah atau lanjutkan risiko ke level berikutnya'
handler.command = /^surprisedeal$/i
handler.register = true
handler.limit = false

export default handler
