import { handleAfkMessage } from '../../lib/afk.js'
// Compatibility hook. Native handler checks activity earlier; dedup prevents a second check.
export async function before(m,extra={}) {
 const conn=extra.conn||this
 return handleAfkMessage(m,conn,{prefix:extra.usedPrefix||m.prefix||conn?.botConfig?.defaultPrefix||'/',type:extra.chatUpdate?.type})
}
