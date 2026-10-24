let handler = async (m, { conn }) => {

  let anyaQuotes = [
    'Waku waku~ AlzRiss datang! 🥜✨',
    'Hehe~ AlzRiss dipanggil ya? (≧▽≦)',
    'AlzRiss tahu kamu manggil AlzRiss~ 🥜',
    'Chi chi~ AlzRiss siap membantu!',
    'Yor mama cantik... Loid papa keren... 😌',
    'AlzRiss suka kacang dan starlight ⭐',
    'Eh? Ada misi baru buat AlzRiss? 👀',
    'Waku waku intensifies!! ✨'
  ]

  let text = anyaQuotes[Math.floor(Math.random() * anyaQuotes.length)]

  await conn.sendMessage(
    m.chat,
    {
      text
    },
    {
      quoted: {
        key: {
          fromMe: false,
          participant: '0@s.whatsapp.net',
          remoteJid: 'status@broadcast'
        },
        message: {
          conversation: '🌸 Usanagi Umi AI - Spy x Family 🌸'
        }
      }
    }
  )
}

handler.customPrefix = /^(usanagi|bot|tes|test)$/i
handler.command = /^(usanagi|bot|tes|test)$/i

export default handler