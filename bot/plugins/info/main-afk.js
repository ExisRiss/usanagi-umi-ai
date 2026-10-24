import { setAfk, persistAfk } from '../../core/awang-afk.js'
const handler = async (m, { text = '', conn }) => {
 const entry=setAfk(m.sender,text)
 if(!entry)return
 await persistAfk()
 return conn.sendMessage(m.chat,{text:`💤 @${m.sender.split('@')[0]} sekarang AFK${entry.reason?': '+entry.reason:''}.\nKirim pesan apa saja untuk mengakhiri AFK.`,mentions:[m.sender]},{quoted:m})
}
handler.help=['afk [alasan]']
handler.tags=['main']
handler.command=/^afk$/i
export default handler
