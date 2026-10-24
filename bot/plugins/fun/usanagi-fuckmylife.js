/* By AlzRiss - Usanagi Umi AI */

const list = [
  'Hari ini aku bangun siang, terburu-buru ke kantor, ternyata libur.',
  'Baru sadar bawa dompet kosong setelah antri panjang di kasir.',
  'Chat penting ke gebetan malah terkirim ke grup keluarga.',
  'Makan pedas biar semangat, hasilnya sakit perut seharian.',
  'Alarm bunyi, snooze, snooze lagi, dan... terlambat.',
  'Isi bensin full tank, esoknya naik harga turun.',
  'Nyari kacamata keliling rumah, ternyata di atas kepala.',
  'Mau pamer foto aesthetic, malah ke-post foto jelek.',
  'Janji olahraga pagi, bangun jam 11 dengan alasan hujan.',
  'Beli baju diskon, pas sampai rumah baru sadar ukurannya salah.'
]

const handler = async (m) => {
  const item = list[Math.floor(Math.random() * list.length)]
  await m.reply(`*FML*\n\n${item}`)
}

handler.command = /^(fuckmylife|fml)$/i
handler.help = ['fml']
handler.tags = ['fun']
handler.description = 'Cerita FML acak'

export default handler
