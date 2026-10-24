let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (!user.atm) {
    return conn.reply(
      m.chat,
      '💳 Kamu belum memiliki ATM.',
      m
    )
  }

  const levels = [
    { cap: 1000, price: 100000 },
    { cap: 5000, price: 250000 },
    { cap: 10000, price: 500000 },
    { cap: 25000, price: 1000000 },
    { cap: 50000, price: 0 }
  ]

  let current = levels.findIndex(v => v.cap === user.fullatm)

  if (current === -1) current = 0

  if (current >= levels.length - 1) {
    return conn.reply(
      m.chat,
      '🌸 ATM kamu sudah mencapai level maksimal.',
      m
    )
  }

  let next = levels[current + 1]

  if (user.money < next.price) {
    return conn.reply(
      m.chat,
      `💸 Uang kurang.\n\nHarga Upgrade: ${next.price}`,
      m
    )
  }

  user.money -= next.price
  user.fullatm = next.cap

  conn.reply(
    m.chat,
    `
🌸 *ALZRISS ATM UPGRADE* ❀

╭──〔 UPGRADE BERHASIL 〕──╮
│ 🏦 Kapasitas Baru
│ ${next.cap}
│
│ 💰 Biaya
│ ${next.price}
╰──────────────────╯
`.trim(),
    m
  )
}

handler.help = ['upgradeatm']
handler.tags = ['rpg']
handler.command = /^upgradeatm$/i

export default handler