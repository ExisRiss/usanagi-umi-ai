let lastCheck = 0

export async function before(m, { conn }) {
  const now = Date.now()

  if (now - lastCheck < 60000) return
  lastCheck = now

  if (!global.db.data.sewa) return

  for (const [jid, data] of Object.entries(global.db.data.sewa)) {
    if (!data?.expired) continue

    const sisa = data.expired - now

    try {
      if (sisa <= 86400000 && !data.warn24h) {
        await conn.sendMessage(jid, {
          text: '⚠️ Masa sewa bot akan berakhir dalam 24 jam.'
        })
        data.warn24h = true
      }

      if (sisa <= 0) {
        await conn.sendMessage(jid, {
          text: '❌ Masa sewa habis, bot akan keluar dari grup.'
        })

        await conn.groupLeave(jid)
        delete global.db.data.sewa[jid]
      }
    } catch (e) {
      console.error('[SEWA]', e)
    }
  }

  return false
}