/* By AlzRiss - Usanagi Umi AI */

const list = [
  'Aku ingin mencintaimu dengan sederhana\nDengan kata yang tak sempat diucapkan\nKayu kepada api yang menjadikannya abu',
  'Jika engkau adalah hujan\nmaka biarkan aku menjadi tanah\nyang siap menerima setiap tetesmu',
  'Ada yang pergi tanpa pamit\nada yang tinggal tanpa diminta\ndan aku belajar menerima keduanya',
  'Waktu mengajarkanku diam\ndiam mengajarkanku mengerti\nmengerti mengajarkanku melepaskan',
  'Bukan karena engkau sempurna\naku mencinta\ntapi karena dalam ketidaksempurnaanmu\naku menemukan rumah'
]

const handler = async (m) => {
  const item = list[Math.floor(Math.random() * list.length)]
  await m.reply(`*PUISI*\n\n${item}`)
}

handler.command = /^(puisi|sajak)$/i
handler.help = ['puisi']
handler.tags = ['fun']
handler.description = 'Puisi acak'

export default handler
