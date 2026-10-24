let handler = async (m, { conn }) => {

  let e = global.rpg.emoticon
  let text = `
🌸 *ALZRISS RPG SHOP* ❀

━━━━━━━━━━━━━━
🛒 *ITEM SHOP*

${e('potion')} Potion : 5000
${e('sword')} Sword : 15000
${e('pickaxe')} Pickaxe : 10000
${e('fishingrod')} Fishing Rod : 12000
${e('armor')} Armor : 20000

🪱 Bait : 1000
🌱 Fertilizer : 2500

━━━━━━━━━━━━━━
🎁 *CRATE SHOP*

📦 Common Crate : 10000
📦 Uncommon Crate : 25000
🎁 Mythic Crate : 75000
🗃️ Legendary Crate : 200000

━━━━━━━━━━━━━━
📌 *Cara Membeli*

.buy nama_item jumlah

Contoh:
.buy potion
.buy potion 5
.buy sword
.buy common 3
.buy mythic 2

━━━━━━━━━━━━━━
💡 *Daftar Nama Item*

• potion
• sword
• pickaxe
• fishingrod
• armor
• bait
• fertilizer
• common
• uncommon
• mythic
• legendary

━━━━━━━━━━━━━━
✦ AlzRiss RPG System
`.trim()

  await conn.sendMessage(m.chat, {
    text
  }, { quoted: m })

}

handler.help = ['shop']
handler.tags = ['rpg']
handler.command = /^(shop)$/i
handler.group = true

export default handler