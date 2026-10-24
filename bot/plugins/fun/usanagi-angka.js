
const handler = async (m) => {
  const valid = ['0','1','2','3','4','5','6','7','8','9']
  const userNum = (m.args?.[0] || m.text || '').trim()
  if (!userNum || !valid.includes(userNum)) {
    return m.reply(
      `*TEBAK ANGKA*\n\n` +
      `Masukkan angka 0 sampai 9.\n\n` +
      `Contoh:\n` +
      `> .angka 5`
    )
  }
  const botNum = valid[Math.floor(Math.random() * valid.length)]
  const benar = userNum === botNum
  await m.reply(
    `*TEBAK ANGKA*\n\n` +
    `Angka kamu : *${userNum}*\n` +
    `Angka bot  : *${botNum}*\n\n` +
    (benar ? 'Hasil : *BENAR!*' : 'Hasil : *SALAH!*')
  )
}

handler.command = /^(angka|tebakangka)$/i
handler.help = ['angka']
handler.tags = ['fun']
handler.description = 'Tebak angka 0-9 lawan bot'

export default handler
