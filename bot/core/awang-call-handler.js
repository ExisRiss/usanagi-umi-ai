/* By AlzRiss - Usanagi Umi AI */

import { isAnticallActive } from './awang-call.js'

const ANTICALL_WARNING_TEXT = '*⚠️ SISTEM ANTI CALL AKTIF*\n\nHarap agar tidak call/menelfon bot.'

export function attachAnticallHandler(conn) {
  conn.ev.on('call', async (calls) => {
    for (const call of calls) {
      if (call.status !== 'offer') continue

      try {
        const active = await isAnticallActive()
        if (!active) continue

        await conn.rejectCall(call.id, call.from)
        await conn.sendMessage(call.chatId, { text: ANTICALL_WARNING_TEXT })
      } catch (err) {
        console.log(`  \x1b[31m✗\x1b[0m  Error di sistem Anti Call: ${err.message}`)
      }
    }
  })
}

export default { attachAnticallHandler }
