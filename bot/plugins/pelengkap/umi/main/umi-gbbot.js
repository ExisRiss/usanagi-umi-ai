import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gbbot", "category": "main", "aliasMap": {"umi-main-gbbot": "gbbot", "umi-gbbot": "gbbot", "umi-botgb": "botgb", "umi-officialgb": "officialgb", "umi-grupbot": "grupbot", "umi-gcbot": "gcbot", "umi-setgbbot": "setgbbot", "gbbot": "gbbot", "botgb": "botgb", "officialgb": "officialgb", "grupbot": "grupbot", "gcbot": "gcbot", "setgbbot": "setgbbot"}, "description": "Menampilkan dan mengatur link Grup Official Bot", "usage": ".gbbot / .setgbbot <link>", "example": ".setgbbot https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxxxx", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/gbbot.js", metadata, m, extra)
handler.help = ["umi-main-gbbot / .setgbbot <link>"]
handler.command = ["umi-main-gbbot", "umi-gbbot", "umi-botgb", "umi-officialgb", "umi-grupbot", "umi-gcbot", "umi-setgbbot", "gbbot", "botgb", "officialgb", "grupbot", "gcbot", "setgbbot"]
handler.tags = ["main"]
handler.description = "Menampilkan dan mengatur link Grup Official Bot"
handler.importSource = "umi"
handler.importConfig = {"name": "gbbot", "alias": ["botgb", "officialgb", "grupbot", "gcbot", "setgbbot"], "category": "main", "description": "Menampilkan dan mengatur link Grup Official Bot", "usage": ".gbbot / .setgbbot <link>", "example": ".setgbbot https://chat.whatsapp.com/xxxxxxxxxxxxxxxxxxxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-main-gbbot": "gbbot", "umi-gbbot": "gbbot", "umi-botgb": "botgb", "umi-officialgb": "officialgb", "umi-grupbot": "grupbot", "umi-gcbot": "gcbot", "umi-setgbbot": "setgbbot", "gbbot": "gbbot", "botgb": "botgb", "officialgb": "officialgb", "grupbot": "grupbot", "gcbot": "gcbot", "setgbbot": "setgbbot"}
export default handler
