/* By AlzRiss - Usanagi Umi AI */

const list = [
  'Senja mengajarkan bahwa keindahan bisa datang di akhir hari.',
  'Di bawah langit oranye, semua rasa seolah menemukan tempatnya.',
  'Senja bukan tentang perpisahan, tapi tentang menikmati proses menuju malam.',
  'Ada yang mencari matahari, ada yang jatuh cinta pada senja.',
  'Senja hadir tanpa diminta, seperti rasa yang tiba-tiba datang.',
  'Langit senja tidak pernah meminta perhatian, tapi selalu diperhatikan.',
  'Kadang hati lebih tenang saat menatap senja tanpa kata.',
  'Senja adalah pengingat bahwa setiap akhir bisa indah.'
]

const handler = async (m) => {
  const item = list[Math.floor(Math.random() * list.length)]
  await m.reply(`*SENJA*\n\n${item}`)
}

handler.command = /^(senja)$/i
handler.help = ['senja']
handler.tags = ['fun']
handler.description = 'Kutipan senja acak'

export default handler
