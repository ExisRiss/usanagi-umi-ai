import moment from 'moment'

const handler = async (m) => {
  if (!m.isGroup) return m.reply('Fitur ini hanya untuk grup.')

  const jid = m.chat
  const data = global.db?.sewa?.[jid]

  if (!data) return m.reply('❌ Grup ini tidak sedang dalam masa sewa.')

  const now = Date.now()
  const sisa = data.expired - now

  if (sisa <= 0) {
    return m.reply('❌ Sewa sudah habis.')
  }

  const hari = Math.floor(sisa / 86400000)
  const jam = Math.floor((sisa % 86400000) / 3600000)
  const menit = Math.floor((sisa % 3600000) / 60000)

  m.reply(
`📦 INFO SEWA GRUP

⏳ Sisa: ${hari} hari ${jam} jam ${menit} menit
📅 Expired: ${moment(data.expired).format('DD/MM/YYYY HH:mm')}
`
  )
}

handler.command = ['ceksewa']
export default handler