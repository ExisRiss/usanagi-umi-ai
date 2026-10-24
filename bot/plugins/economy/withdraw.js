let handler = async (m, { conn, args }) => {
  let user = global.db.data.users[m.sender]

  if (!user.atm) {
    return conn.reply(m.chat, '💳 Kamu belum memiliki ATM.', m)
  }

  let count = Math.floor(Number(args[0]))

  if (!count || count < 1) {
    return conn.reply(
      m.chat,
      'Contoh:\n.withdraw 5000',
      m
    )
  }

  if (user.bank < count) {
    return conn.reply(
      m.chat,
      '🏦 Saldo bank tidak cukup.',
      m
    )
  }

  user.bank -= count
  user.money += count

  conn.reply(
    m.chat,
    `
🌸 *ALZRISS WITHDRAW* ❀

╭──〔 PENARIKAN BERHASIL 〕──╮
│ 💰 Withdraw : ${count}
│ 🏦 Sisa Saldo : ${user.bank}
╰────────────────────╯
`.trim(),
    m
  )
}

handler.help = ['withdraw <jumlah>']
handler.tags = ['rpg']
handler.command = /^withdraw$/i

export default handler