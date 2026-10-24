let handler = async (m, { conn }) => {
  try {
    // 📊 Ambil data
    let total = Object.keys(global.plugins || {}).length
    let aktif = Object.values(global.plugins || {}).filter(v => !v.disabled).length

    // ⚡ Speed
    let speed = Date.now() - (m.messageTimestamp * 1000)

    // ⏱️ Runtime
    let runtime = process.uptime()
    let jam = Math.floor(runtime / 3600)
    let menit = Math.floor((runtime % 3600) / 60)

    let runtimeText = `${jam} jam ${menit} menit`

    // 🚀 Kirim rich table
    await conn.relayMessage(m.chat, {
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [
              {
                messageType: 4,
                tableMetadata: {
                  caption: "Statistik Bot",
                  rows: [
                    { items: ["Fitur Total", `${total}`] },
                    { items: ["Fitur Aktif", `${aktif}`] },
                    { items: ["Speed", `${speed} ms`] },
                    { items: ["Runtime", runtimeText] }
                  ]
                }
              }
            ],
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: {
                botJid: conn.user.jid
              },
              forwardOrigin: 4
            }
          }
        }
      }
    }, {})

  } catch (e) {
    // 🛟 Fallback kalau gagal
    let total = Object.keys(global.plugins || {}).length
    let aktif = Object.values(global.plugins || {}).filter(v => !v.disabled).length
    let speed = Date.now() - (m.messageTimestamp * 1000)

    let runtime = process.uptime()
    let jam = Math.floor(runtime / 3600)
    let menit = Math.floor((runtime % 3600) / 60)

    let runtimeText = `${jam} jam ${menit} menit`

    await m.reply(`📊 *Statistik Bot*

Fitur Total   : ${total}
Fitur Aktif   : ${aktif}
Speed         : ${speed} ms
Runtime       : ${runtimeText}`)
  }
}

handler.help = ['stats']
handler.tags = ['info']
handler.command = /^(stats|stat)$/i

export default handler