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

import fs from 'fs';
import path from 'path';
const pluginConfig = {
    name: "gachabini",
    category: "fun",
    description: "Gacha bini waifu random 300+ karakter",
    usage: ".gachabini",
    isEnabled: true
}

let cachedThumb = null
try {

const thumbPath = path.join(process.cwd(),"assets","images","alzriss-gachabini.jpg")

if(fs.existsSync(thumbPath)){
cachedThumb = fs.readFileSync(thumbPath)
}

} catch(e){
console.log(e)
}

const waifuList = [

"AlzRiss","Rem","Ram","Emilia","Satella","Echidna","Beatrice","Priscilla","Crusch",
"Kurisu Makise","Mayuri Shiina","Suzuha Amane",
"Mikasa Ackerman","Annie Leonhart","Historia Reiss","Sasha Blouse","Pieck Finger",
"Hinata Hyuga","Sakura Haruno","Ino Yamanaka","Tsunade","Kushina Uzumaki",
"Asuna Yuuki","Sinon","Leafa","Alice Zuberg",
"Rias Gremory","Akeno Himejima","Koneko Toujou","Asia Argento","Xenovia",
"Yor Forger","Frieren","Fiona Frost",
"Mitsuri Kanroji","Shinobu Kocho","Kanao Tsuyuri","Nezuko Kamado","Daki",
"Power","Makima","Himeno","Kobeni","Reze",
"Kaguya Shinomiya","Chika Fujiwara","Ai Hayasaka","Miko Iino",
"Ichika Nakano","Nino Nakano","Miku Nakano","Yotsuba Nakano","Itsuki Nakano",
"Mai Sakurajima","Tomoe Koga","Rio Futaba",
"Lucy Heartfilia","Erza Scarlet","Juvia Lockser","Mirajane Strauss",
"Taiga Aisaka","Minori Kushieda","Ami Kawashima",
"Marin Kitagawa","Sajuna Inui","Shinju Inui",
"Shikimori","Izumi's Mom",
"Nagatoro","Gamo","Yoshi","Sakura Nagatoro",
"Uzaki Hana","Tsuki Uzaki",
"Nazuna Nanakusa","Akira Asai",
"Frieren","Fern","Serie","Ubel",
"Maomao","Gyokuyou",
"Ai Hoshino","Kana Arima","Akane Kurokawa","Ruby Hoshino","Memcho",
"Raphtalia","Filo","Melty",
"Roxy Migurdia","Sylphiette","Eris Boreas",
"Aqua","Darkness","Megumin",
"Hestia","Ais Wallenstein",
"Holo",
"Tohru","Kanna Kamui","Lucoa","Elma",
"Mikoto Misaka","Misaki Shokuhou","Kuroko Shirai",
"Yukino Yukinoshita","Yui Yuigahama","Iroha Isshiki","Shizuka Hiratsuka",
"Rikka Takarada","Akane Shinjo",
"Rukia Kuchiki","Orihime Inoue","Yoruichi",
"Boa Hancock","Nami","Robin","Vivi","Yamato","Uta",
"Bulma","Android 18","Videl",
"Esdeath","Akame","Chelsea","Mine","Leone",
"Shinoa Hiiragi","Krul Tepes",
"Illyasviel","Saber","Rin Tohsaka","Sakura Matou",
"Yuno Gasai","Yuki Amano's Mom",
"Medusa Gorgon",
"Albedo","Shalltear","Aura Bella Fiora",
"Delta","Alpha","Beta","Gamma","Epsilon","Zeta",
"Chisato Nishikigi","Takina Inoue",
"Rebecca (Cyberpunk)","Lucy (Cyberpunk)",
"Anju Emma","Lena (86)",
"Vladilena Milize",
"Vivy",
"Shiraori",
"Anisphia Wynn Palletia","Euphyllia Magenta",
"Akari Watanabe",
"Alya","Yuki Suou",
"Aharen Reina",
"Tomoko Kuroki",
"Menma",
"Haruhi Suzumiya",
"Misato Katsuragi","Asuka Langley","Rei Ayanami",
"Matoi Ryuko","Satsuki Kiryuin",
"Akari Mizunashi",
"Chika Takami","Riko Sakurauchi",
"Honoka Kosaka","Kotori Minami","Umi Sonoda",
"Nico Yazawa","Maki Nishikino","Eli Ayase",
"Hanayo Koizumi","Nozomi Tojo","Rin Hoshizora"

]

async function handler(m,{ sock }){

const name = m.pushName || "Darling"
const waifu = waifuList[Math.floor(Math.random() * waifuList.length)]
const love = Math.floor(Math.random() * 101)

const statusList = [
"💖 Cinta Sejati",
"💘 Pasangan Serasi",
"💕 Jodoh Anime",
"💞 Relationship Goals",
"💓 Bucin Maksimal",
"💔 Hubungan Toxic 🗿"
]

const status = statusList[Math.floor(Math.random()*statusList.length)]

const responses = [

`╔═══『 💍 *GACHA BINI* 』═══╗
┃
┃ 👤 Suami : *${name}*
┃ 👰 Istri : *${waifu}*
┃
┃ 💖 Love Meter : *${love}%*
┃ 📊 Status : *${status}*
┃
┃ Omedetou atas pernikahan kalian!
┃ Semoga langgeng selamanya ❤️
┃
╚════════════════════╝`,

`┏━━━〔 👰 *WAIFU FOUND* 〕━━━┓
┃
┃ 🎉 Selamat!!
┃
┃ 👤 *${name}*
┃ ❤️ *${waifu}*
┃
┃ 💘 Kecocokan : *${love}%*
┃ 📊 Status : *${status}*
┃
┃ Jangan disia-siakan ya 😉
┃
┗━━━━━━━━━━━━━━━━━━┛`,

`╭────〔 💞 *MATCHMAKING* 〕────╮
│
│ 👤 Player : *${name}*
│ 💖 Waifu : *${waifu}*
│
│ 💓 Love Level : *${love}%*
│ 📊 Status : *${status}*
│
│ Sistem telah menjodohkan kalian
│ secara random 🗿
│
╰────────────────────╯`

]

const reply = responses[Math.floor(Math.random()*responses.length)]

await sock.sendMessage(m.chat,{
image: cachedThumb,
caption: reply
},{quoted:m})

}

/* Compatibility adapter — By AlzRiss - Usanagi Umi AI */
const __umiCommands = ["gachabini"]
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
__umiHandler.help = ["gachabini .gachabini"]
__umiHandler.tags = ["fun"]
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
