const handler = async (m, { text, isOwner }) => {
  if (!isOwner) return m.reply('Owner only.')
  if (!m.isGroup) return m.reply('Harus di grup.')

  const jid = m.chat
  const data = global.db.sewa[jid]

  if (!data) return m.reply('Grup ini tidak dalam status sewa.')

  const days = parseInt(text)
  if (!days) return m.reply('Contoh: .perpanjangsewa 3')

  const base = data.expired > Date.now() ? data.expired : Date.now()
  data.expired = base + days * 86400000

  data.warned = {}

  m.reply(`🔁 Sewa diperpanjang ${days} hari`)
}

handler.command = ['perpanjangsewa', 'extendsewa']
export default handler