let handler = async (m, { conn }) => {
  let found = false
  let answer = ''

  function clearRoomTimer(room) {
    if (!room) return
    if (room.timeout) clearTimeout(room.timeout)
    if (room.timer) clearTimeout(room.timer)
    if (Array.isArray(room)) {
      for (let item of room) {
        if (item && typeof item === 'object' && item._onTimeout) clearTimeout(item)
      }
    }
  }

  function getAnswer(room) {
    if (!room) return ''
    if (room.answerOriginal) return room.answerOriginal
    if (room.jawaban) return room.jawaban
    if (room.answer) return room.answer
    if (room.quest && room.quest.quest) return room.quest.quest
    if (Array.isArray(room)) {
      if (room[1] && room[1].jawaban) return room[1].jawaban
      if (room[1] && room[1].answer) return room[1].answer
      if (Array.isArray(room[1])) {
        let bomb = room[1].find(v => v && v.emot === '💥')
        if (bomb) return `Bom berada di kotak nomor ${bomb.number || bomb.position}`
      }
    }
    return ''
  }

  // Game yang disimpan langsung di conn.namaGame[m.chat]
  for (let key in conn) {
    let gameObj = conn[key]
    if (!gameObj || typeof gameObj !== 'object') continue
    if (!(m.chat in gameObj)) continue

    let room = gameObj[m.chat]
    let ans = getAnswer(room)
    if (!ans) continue

    clearRoomTimer(room)
    answer = ans
    delete gameObj[m.chat]
    found = true
    break
  }

  // Game yang disimpan di conn.game dengan key khusus, contoh tebakgambar-family100
  if (!found && conn.game && typeof conn.game === 'object') {
    for (let id in conn.game) {
      if (!id.includes(m.chat)) continue
      let room = conn.game[id]
      let ans = getAnswer(room)
      if (!ans) continue

      clearRoomTimer(room)
      answer = ans
      delete conn.game[id]
      found = true
      break
    }
  }

  // Game tebak bendera pakai global
  if (!found && global.tebakbendera && global.tebakbendera[m.chat]) {
    let room = global.tebakbendera[m.chat]
    clearRoomTimer(room)
    answer = room.answer
    delete global.tebakbendera[m.chat]
    found = true
  }

  if (!found) return m.reply('❌ Tidak ada game yang sedang berlangsung')

  await conn.sendMessage(
    m.chat,
    {
      text: `🏳️ *MENYERAH!*\n\nJawaban:\n${answer}`
    },
    { quoted: global.fstatus }
  )
}

handler.help = ['nyerah']
handler.tags = ['game']
handler.command = /^(nyerah|skip|surrender)$/i

export default handler
