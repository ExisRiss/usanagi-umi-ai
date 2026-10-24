let handler = async (m, { conn }) => {
  let groups = await conn.groupFetchAllParticipating()
  let list = Object.values(groups)

  if (!list.length) throw 'Bot belum masuk grup manapun.'

  let teks = `📋 *LIST GRUP BOT*\n\n`
  for (let i = 0; i < list.length; i++) {
    let g = list[i]
    teks += `${i + 1}. *${g.subject}*\n`
    teks += `   🆔 ID: ${g.id}\n`
    teks += `   👥 Member: ${g.participants?.length || 0}\n\n`
  }

  teks += `Total Grup: ${list.length}`
  m.reply(teks)
}

handler.help = ['listgc']
handler.tags = ['owner']
handler.command = /^list(gc|grup)?$/i
handler.limit = false
handler.owner = true 

export default handler