let handler = async (m, { conn }) => {
  let teks = [
    'Badut paling setia yang masih berharap dia balik lagi padahal udah punya yang baru 🤡'
  ]

  let hasil = teks[Math.floor(Math.random() * teks.length)]

  conn.sendMessage(m.chat, {
    text: hasil
  }, { quoted: m })
}

handler.help = ['carabalikan']
handler.tags = ['fun']
handler.command = /^carabalikan$/i

export default handler