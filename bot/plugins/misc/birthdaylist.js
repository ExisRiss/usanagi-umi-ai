let handler = async (m) => {
  const db = global.db?.data?.users
  if (!db) return m.reply('❌ DB tidak ditemukan')

  const list = Object.entries(db)
    .filter(([_, u]) => u?.birthday)

  if (!list.length) return m.reply('❌ Belum ada birthday')

  let text = `📋 *LIST BIRTHDAY*\n\n`

  for (let [jid, u] of list) {
    text += `• @${jid.split('@')[0]} → ${u.birthday}\n`
  }

  m.reply(text, { mentions: list.map(v => v[0]) })
}

handler.help = ['listbirthday']
handler.tags = ['info', 'xp']
handler.command = /^listbirthday$/i
export default handler