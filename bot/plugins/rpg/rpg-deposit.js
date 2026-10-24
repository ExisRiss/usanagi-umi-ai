let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]

  if (!user.atm) {
    return conn.reply(m.chat, '💳 Kamu belum memiliki ATM.', m)
  }

  let count = Math.floor(Number(args[0]))

  if (!count || count < 1) {
    return conn.reply(
      m.chat,
      'Contoh:\n.deposit 5000',
      m
    )
  }

  if (user.money < count) {
    return conn.reply(
      m.chat,
      '💸 Uang kamu tidak cukup.',
      m
    )
  }

  if ((user.bank + count) > user.fullatm) {
    return conn.reply(
      m.chat,
      `🏦 Bank penuh!\n\nLimit ATM: ${user.fullatm}`,
      m
    )
  }

  user.money -= count
  user.bank += count

  conn.reply(
    m.chat,
    `
🌸 *ALZRISS DEPOSIT* ❀

╭──〔 DEPOSIT BERHASIL 〕──╮
│ 💰 Deposit : ${count}
│ 🏦 Saldo : ${user.bank}
╰──────────────────╯
`.trim(),
    m
  )
}

handler.help = ['deposit <jumlah>']
handler.tags = ['rpg']
handler.command = /^deposit$/i

export default handler