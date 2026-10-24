import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  let total = 0

  for (let file of fs.readdirSync('./plugins')) {
    if (!file.endsWith('.js')) continue

    let filePath = path.join('./plugins', file)
    let text = fs.readFileSync(filePath, 'utf8')

    if (text.includes('externalAdReplyOffOffOffOff')) {
      text = text.replaceAll(
        'externalAdReplyOffOffOffOff',
        'externalAdReplyOffOffOffOffOff'
      )

      fs.writeFileSync(filePath, text)
      total++
    }
  }

  conn.reply(m.chat, `✅ ${total} file berhasil di nonaktifkan`, m)
}

handler.help = ['clearead']
handler.tags = ['owner']
handler.command = /^clearead$/i
handler.rowner = true

export default handler