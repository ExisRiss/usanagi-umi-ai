let handler = async (m, { conn }) => {
  let user = global.db.data.users[m.sender]

  if (user.atm) {
    return conn.reply(
      m.chat,
      '🌸 Kamu sudah memiliki ATM.',
      m
    )
  }

  const harga = 50000

  if (user.money < harga) {
    return conn.reply(
      m.chat,
      `🌸 Uang kamu kurang.\n\n💰 Harga ATM: ${harga}`,
      m
    )
  }

  user.money -= harga
  user.atm = true
  user.bank = 0
  user.fullatm = 1000

  conn.reply(
    m.chat,
    `
🌸 *ALZRISS ATM PURCHASE* ❀

╭──〔 ATM BERHASIL DIBELI 〕──╮
│ 💳 ATM : Aktif
│ 💰 Harga : ${harga}
│ 🏦 Kapasitas : 1000
╰────────────────────╯
`.trim(),
    m
  )
}

handler.help = ['buyatm']
handler.tags = ['rpg']
handler.command = /^buyatm$/i

export default handler