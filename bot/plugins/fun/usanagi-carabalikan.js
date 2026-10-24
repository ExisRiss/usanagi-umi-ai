
const teks = [
  'Badut paling setia yang masih berharap dia balik lagi padahal udah punya yang baru.',
  'Masih nunggu chat padahal last seen 3 hari yang lalu.',
  'Typing... tapi enggak pernah kirim pesan.',
  'Seen 12:00 tapi balas jam 23:00 dengan "oh".',
  'Masih simpan chat lama biar ada harapan.',
  'Berharap dia yang chat duluan padahal kamu yang butuh.',
  'Masih cek profil dia tiap malam sebelum tidur.',
  'Pura-pura sibuk biar dia kangen, tapi malah dilupain.',
  'Nunggu notif dari dia, tapi yang datang cuma spam promo.',
  'Masih mikirin dia pas lagi sama yang lain.'
]

const handler = async (m) => {
  const hasil = teks[Math.floor(Math.random() * teks.length)]
  await m.reply(
    `*CARA BALIKAN*\n\n` +
    `${hasil}`
  )
}

handler.command = /^(carabalikan|balikan)$/i
handler.help = ['carabalikan']
handler.tags = ['fun']
handler.description = 'Random status "cara balikan" lucu'

export default handler
