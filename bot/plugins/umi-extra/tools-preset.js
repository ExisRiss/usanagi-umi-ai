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


async function loadImageBuffer(url) {
    const response = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) throw new Error(`Gagal memuat gambar (${response.status})`);
    return Buffer.from(await response.arrayBuffer());
}

const pluginConfig = {
    name: 'preset',
    alias: ['prst'],
    category: 'tools',
    description: 'Generate teks preset auto copy 😈',
    usage: '.preset linkVT|link916|link11|linkXML',
    example: '.preset https://vt|https://916|https://11|https://xml',
    cooldown: 3,
    isEnabled: true
}

function buildText(vt, l916, l11, xml) {
    return `⌜ 𝐏𝐑𝐄𝐒𝐄𝐓 𝐅𝐑𝐄𝐄 ⌟

⌁ TikTok (Preview dulu sebelum pakai 😈)  
→ ${vt}

─────

▣ 9:16 〔 5MB 〕  
→ ${l916 || "-"}

▢ 1:1  
→ ${l11 || "-"}

⌬ XML + ALL SIZE  
→ ${xml || "-"}

─────

⟡ Group  
→ https://chat.whatsapp.com/K3D6KzY62PS37TeCsn9M2B?mode=gi_t

─────

#prstalzriss  
#alzrisswangyy  

⌘ search : gm_zero_12

⌜ NOPE ⌟
PRESET TIDAK MEMILIKI CC DAN CG  
CC TANGGUNG JAWAB USER  
DILARANG REUPLOAD TANPA CR  
WAJIB CR SAAT DIGUNAKAN`
}

async function handler(m, { sock }) {

    const input = m.text?.trim()
    if (!input) return m.reply('Format:\n.preset linkVT|link916|link11|linkXML')

    const [vt, l916, l11, xml] = input.split('|')

    if (!vt || !l916) {
        return m.reply('Minimal isi link VT & 9:16 🗿')
    }

    const imgUrl = 'https://files.catbox.moe/s1fkp1.png'
    const finalText = buildText(vt, l916, l11, xml)

    // 💗 LOADING MESSAGE
    await sock.sendMessage(m.chat, {
        image: await loadImageBuffer(imgUrl),
        caption: `💗 *AlzRiss lagi nyusun preset kamu...* 😈

Tunggu bentar ya darling~`
    }, { quoted: m })

    await new Promise(res => setTimeout(res, 2000))

    // 🔥 CTA COPY BUTTON
    const buttons = [
        {
            name: 'cta_copy',
            buttonParamsJson: JSON.stringify({
                display_text: '📋 Copy Semua Teks',
                copy_code: finalText
            })
        }
    ]

    // 🚀 FINAL MESSAGE
    await sock.sendMessage(m.chat, {
        image: await loadImageBuffer(imgUrl),
        caption: finalText,
        footer: 'AlzRiss AI 💗',
        interactiveButtons: buttons
    }, { quoted: m })
}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["preset", "prst"]
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
__umiHandler.help = ["preset .preset linkVT|link916|link11|linkXML"]
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
