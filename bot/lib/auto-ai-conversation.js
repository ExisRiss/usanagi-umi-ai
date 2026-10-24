import { redactProviderSecrets } from './groq-client.js'

// Only explicitly addressed AutoAI turns, never WhatsApp history or other members' chats.
// RAM-only, bounded and expiring; no disk backup, phone/LID inference or cross-session recall.
export function conversationKey({ conn, botConfig = {}, m } = {}) {
  const scope = botConfig.scope || conn?.botConfig?.scope || conn?.user?.id
  if (!scope || !m?.chat || !m?.sender) return ''
  return JSON.stringify([String(scope), String(m.chat), String(m.sender).replace(/:\d+(?=@)/, '')])
}
export function conversationText(value) {
  return redactProviderSecrets(value).replace(/\b(password|passwd|kata sandi|token|api[_ -]?key|otp|kode pairing)\s*[:=]\s*[^\s,;]+/gi, '$1: <redacted>')
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim()
}
export function createConversationMemory({ now = Date.now, ttlMs = 20 * 60000, maxThreads = 128, maxTurns = 4, maxChars = 2400 } = {}) {
  const threads = new Map()
  function prune() { for (const [key, row] of threads) if (row.expires <= now()) threads.delete(key) }
  function history(key) {
    prune(); const row = threads.get(key); if (!row) return []
    const result = []; let chars = 0
    for (const turn of [...row.turns].reverse()) {
      const size = turn.user.length + turn.assistant.length
      if (chars + size > maxChars) break
      result.unshift({ ...turn }); chars += size
    }
    return result
  }
  function prepare(key, user, assistant) {
    prune(); if (!key) return null
    let row = threads.get(key)
    if (!row) {
      while (threads.size >= maxThreads) threads.delete(threads.keys().next().value)
      row = { turns: [], expires: now() + ttlMs }; threads.set(key, row)
    }
    return { key, row, used: false, turn: { user: conversationText(user).slice(0, 800), assistant: conversationText(assistant).slice(0, 800) } }
  }
  function current(ticket) { prune(); return Boolean(ticket && !ticket.used && threads.get(ticket.key) === ticket.row) }
  function commit(ticket) {
    if (!current(ticket) || !ticket.turn.user || !ticket.turn.assistant) return false
    ticket.used = true; const row = ticket.row
    row.turns.push({ ...ticket.turn }); row.turns = row.turns.slice(-maxTurns); row.expires = now() + ttlMs
    threads.delete(ticket.key); threads.set(ticket.key, row)
    return true
  }
  function clear(key) { return threads.delete(key) }
  return { history, prepare, commit, clear, prune, current }
}
export const conversationMemory = createConversationMemory()
const cleanup = setInterval(() => conversationMemory.prune(), 60000)
cleanup.unref()

// Narrow high-confidence chat-only gate. Ordinary questions/curhat cannot become actions
// just because a command name appears in them or in remembered/quoted text.
export function conversationOnly(text) {
  const raw = String(text || '').trim()
  if (/\b(?:cuma|hanya|sekadar)\s+(?:mau\s+|pengen\s+)?(?:ngobrol|cerita|curhat|didengerin|didengarkan|ditemenin)|\b(?:jangan|ga usah|nggak usah|gak usah)\s+(?:jalankan|jalanin|eksekusi|pakai)\s+(?:command|perintah|fitur)/i.test(raw)) return true
  if (/\b(?:tolong|coba|please|bantu(?:in)?|bisa(?:kah)?|boleh|minta)\s+(?:(?:aku|saya|kamu|bot|umi)\s+)?(?:buat(?:kan)?|bikin(?:in)?|kirim(?:in|kan)?|download|unduh|putar(?:kan)?|main|jalanin|jalankan|buka(?:in)?|tutup|gabung)\b/i.test(raw)) return false
  if (/^(?:apa(?:kah)?|kenapa|mengapa|gimana|bagaimana|menurutmu|menurut kamu|menurut lo)\b/i.test(raw)) return true
  if (/^(?:(?:aku|gue|gw|saya)\s+(?:lagi\s+)?(?:capek|lelah|sedih|kesal|marah|senang|seneng|bingung|takut|khawatir|kepikiran|cemas|panik|stres|stress|bosan|bosen|kesepian|kangen|pengen cerita|mau cerita)|(?:tadi|kemarin)\s+(?:aku|gue|gw|saya)\b)/i.test(raw)) return true
  if (/^(?:halo|hai|hey|hei|pagi|siang|sore|malam|makasih|terima kasih|thanks|wkwk+|haha+|oke|iya|hmm+|yaudah|dadah|sampai nanti)[!?. ,]*(?:umi|bot|kak|ya|deh|bang)?[!?. ,]*$/i.test(raw)) return true
  return /^(?:terus gimana|terus\??|kok gitu|maksudnya gimana|yang tadi itu|aku cuma mau didengerin)[!?. ,]*$/i.test(raw)
}
export const forgetConversation = text => /^(?:(?:tolong|umi|bot)\s+)?(?:lupakan|hapus|reset)\s+(?:(?:konteks|riwayat|memori)\s+)?(?:obrolan|percakapan|chat)(?:\s+(?:kita|ini|tadi|dong|ya))*[.!?]*$/i.test(String(text || '').trim())
