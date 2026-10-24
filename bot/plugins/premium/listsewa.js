import moment from 'moment'

const handler = async (m) => {
  const db = global.db?.sewa
  if (!db) return m.reply('Belum ada data sewa.')

  const now = Date.now()

  let text = '📋 LIST SEWA AKTIF\n\n'
  let count = 0

  for (const [jid, data] of Object.entries(db)) {
    if (!data?.expired) continue

    const sisa = data.expired - now
    if (sisa <= 0) continue

    count++

    const hari = Math.floor(sisa / 86400000)

    text +=
`➤ Grup: ${jid}
⏳ Sisa: ${hari} hari
📅 Exp: ${moment(data.expired).format('DD/MM/YYYY')}
\n`
  }

  if (count === 0) return m.reply('Tidak ada sewa aktif.')

  text += `\nTotal sewa aktif: ${count}`

  m.reply(text)
}

handler.command = ['listsewa']
export default handler