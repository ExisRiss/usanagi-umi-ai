let handler = async (m, { conn, args }) => {

  let user = global.db.data.users[m.sender]
  let e = global.rpg.emoticon

  let item = (args[0] || '').toLowerCase()
  let jumlah = Math.max(1, parseInt(args[1]) || 1)

  let shop = {
    potion: 5000,
    sword: 15000,
    pickaxe: 10000,
    fishingrod: 12000,
    armor: 20000,
    bait: 1000,
    fertilizer: 2500,
    limit: 25000,

    common: 10000,
    uncommon: 25000,
    mythic: 75000,
    legendary: 200000
  }

  if (!(item in shop))
    return conn.sendMessage(m.chat, {
      text: `
🌸 *ALZRISS RPG SHOP* ❀

${e('potion')} Potion : 5000
${e('sword')} Sword : 15000
${e('pickaxe')} Pickaxe : 10000
${e('fishingrod')} Fishing Rod : 12000
${e('armor')} Armor : 20000

🪱 Bait : 1000
🌱 Fertilizer : 2500
🎫 Limit : 25000

📦 Common : 10000
📦 Uncommon : 25000
🎁 Mythic : 75000
🗃️ Legendary : 200000

Gunakan:
.buy nama_item jumlah

Contoh:
.buy potion 2
.buy common 5
.buy mythic 1
`.trim()
    }, { quoted: m })

  let total = shop[item] * jumlah

  if (user.money < total)
    return m.reply(`${e('money')} Money kamu tidak cukup!`)

  user.money -= total

  switch (item) {
    case 'limit':
      user.limit = (user.limit || 0) + jumlah
      break

    case 'common':
    case 'uncommon':
    case 'mythic':
    case 'legendary':
      user[item] = (user[item] || 0) + jumlah
      break

    default:
      user[item] = (user[item] || 0) + jumlah
  }

  await conn.sendMessage(m.chat, {
    text: `
❀ *PEMBELIAN BERHASIL* ❀

📦 Item : ${item}
🔢 Jumlah : ${jumlah}
💰 Total : ${total}

${e('money')} Sisa Money : ${user.money}
`.trim()
  }, { quoted: m })

}

handler.help = ['buy']
handler.tags = ['rpg']
handler.command = /^(buy)$/i
handler.group = true

export default handler