/* By AlzRiss - Usanagi Umi AI */
/*
╔══════════════════════════════════════════════╗
║        ⚡  𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫  ⚡                     ║
╚══════════════════════════════════════════════╝

╭───────────「 ✦ 𝑰𝑵𝑭𝑶 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 ✦ 」───────────╮
│ 👤 Developer : 𝑨𝒍𝒛𝑹𝒊𝒔𝒔
│ 📢 Saluran   : https://whatsapp.com/channel/0029VbDBOXH11ulIKHVbmO0m
│ ⚙️ Engine    : Baileys Multi-Device
╰──────────────────────────────────────────────╯

              「 ⚡ 𝑨𝑳𝒁𝑹𝑰𝑺𝑺 𝑴𝑫 ⚡ 」
*/

const pluginConfig = {
    name: 'mandiwajib',
    alias: ['caramandiwajib', 'mandiwajib', 'mandi-wajib'],
    category: 'religi',
    description: 'Panduan cara mandi wajib beserta doa',
    usage: '.mandiwajib',
    example: '.mandiwajib',
    isOwner: false,
    isPremium: false,
    isGroup: false,
    isPrivate: false,
    cooldown: 5,
    energi: 0,
    isEnabled: true
}

async function handler(m) {
    const text =
`🕌 *PANDUAN MANDI WAJIB*

Hai ${m.pushName || 'Darling'} 🌙

Mandi wajib dilakukan untuk menghilangkan hadas besar sebelum melakukan ibadah yang mensyaratkan keadaan suci.

╭━━〔 📖 *NIAT* 〕━━╮
┃
┃ *Niat mandi wajib:*
┃
┃ "Saya berniat mandi untuk
┃ menghilangkan hadas besar
┃ karena Allah Ta'ala."
┃
╰━━━━━━━━━━━━━━╯

🚿 *CARA MANDI WAJIB*

1️⃣ *Niat*
   Niatkan dalam hati untuk
   menghilangkan hadas besar.

2️⃣ *Mencuci tangan*
   Bersihkan kedua tangan.

3️⃣ *Membersihkan bagian tubuh*
   Bersihkan bagian tubuh yang
   terkena kotoran/najis.

4️⃣ *Berwudu*
   Lakukan wudu seperti wudu
   untuk salat.

5️⃣ *Membasahi kepala*
   Siram kepala hingga air
   mengenai kulit kepala dan
   seluruh rambut.

6️⃣ *Membasahi seluruh tubuh*
   Siram dan ratakan air ke
   seluruh tubuh. Pastikan tidak
   ada bagian tubuh yang terlewat.

7️⃣ *Selesai*
   Setelah seluruh tubuh terkena
   air, mandi wajib telah selesai.

╭━━〔 🤲 *DOA* 〕━━╮
┃
┃ Setelah mandi wajib, tidak ada
┃ doa khusus yang wajib dibaca.
┃
┃ Kamu dapat membaca doa setelah
┃ wudu jika menginginkannya.
┃
╰━━━━━━━━━━━━━━╯

💡 *Catatan:*
Yang paling penting dalam mandi
wajib adalah *niat* dan memastikan
air mengenai seluruh tubuh.

✨ Semoga bermanfaat dan membantu
kamu menjaga kesucian sebelum
beribadah.

> 🕌 ZERO AI • Islamic Guide`

    await m.reply(text)
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["mandiwajib", "caramandiwajib", "mandi-wajib"]
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
__umiHandler.help = ["mandiwajib .mandiwajib"]
__umiHandler.tags = ["islamic"]
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
