/* By AlzRiss - Usanagi Umi AI */
/*
  Fitur tambahan hasil audit FURINA V17 → Usanagi Umi AI.
*/

const pluginConfig = {
    name: 'dbinary',
    alias: ['decodebinary', 'binary2text'],
    category: 'tools',
    description: 'Decode binary menjadi teks',
    usage: '.dbinary <binary>',
    example: '.dbinary 1001001 110110 110',
    cooldown: 3,
    energi: 1,
    isEnabled: true
}

async function handler(m) {
    const text = m.text?.trim()
    if (!text) return m.reply(`Contoh: ${m.prefix}dbinary 1000001 1000010`)
    const chunks = text.split(/\s+/)
    if (!chunks.every(x => /^[01]+$/.test(x))) return m.reply('❌ Format binary tidak valid.')
    try {
        const result = chunks.map(x => String.fromCharCode(parseInt(x, 2))).join('')
        return m.reply(result || '❌ Binary kosong.')
    } catch {
        return m.reply('❌ Gagal decode binary.')
    }
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["dbinary", "decodebinary", "binary2text"]
const __umiOriginalHandler = handler
const __umiHandler = async function (m, context = {}) {
  const adapted = Object.create(m)
  Object.defineProperties(adapted, {
    text: { value: String(context.text || ''), writable: true, configurable: true },
    args: { value: context.args || [], writable: true, configurable: true },
    command: { value: String(context.command || '').toLowerCase(), writable: true, configurable: true },
    prefix: { value: context.usedPrefix || '.', writable: true, configurable: true },
    isOwner: { value: Boolean(context.isOwner), writable: true, configurable: true },
    isPremium: { value: Boolean(context.isPrems), writable: true, configurable: true },
    isAdmin: { value: Boolean(context.isAdmin), writable: true, configurable: true },
    isBotAdmin: { value: Boolean(context.isBotAdmin), writable: true, configurable: true }
  })
  return __umiOriginalHandler.call(this, adapted, {
    ...context,
    sock: context.conn,
    conn: context.conn,
    text: String(context.text || ''),
    query: String(context.text || ''),
    args: context.args || [],
    command: String(context.command || '').toLowerCase(),
    prefix: context.usedPrefix || '.',
    usedPrefix: context.usedPrefix || '.',
    db: global.db
  })
}
__umiHandler.help = ["dbinary .dbinary <binary>"]
__umiHandler.tags = ["tools"]
__umiHandler.command = new RegExp(`^(${__umiCommands.map(value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})$`, 'i')
__umiHandler.owner = false
__umiHandler.premium = false
__umiHandler.group = false
__umiHandler.private = false
__umiHandler.admin = false
__umiHandler.botAdmin = false
__umiHandler.limit = false
__umiHandler.source = 'Usanagi Umi AI feature collection'
export default __umiHandler
