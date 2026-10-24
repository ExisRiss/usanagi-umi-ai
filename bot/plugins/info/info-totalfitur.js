import fetch from 'node-fetch'

let handler = async (m, { conn }) => {

  let totalFitur = Object.values(global.plugins)
    .filter(v => v.help && v.tags).length

  let totalCommand = Object.values(global.plugins)
    .map(v => v.command)
    .filter(v => v)
    .map(v => Array.isArray(v) ? v.length : 1)
    .reduce((a, b) => a + b, 0)

  let text = `
Total Fitur   : ${totalFitur}
Total Command : ${totalCommand}
`.trim()

  let thumbUrl = 'https://raw.githubusercontent.com/himanackerman/Image/main/1767877404043-832.jpeg'
  let thumbnail = await (await fetch(thumbUrl)).buffer()

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      externalAdReplyOffOffOffOff: {
        body: "✨ Total Fitur",
        thumbnail,
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['totalfitur']
handler.tags = ['info']
handler.command = ['totalfitur']
handler.limit = false

export default handler