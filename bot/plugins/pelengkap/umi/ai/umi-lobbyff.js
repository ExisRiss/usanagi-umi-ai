import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lobbyff", "category": "maker", "aliasMap": {"umi-maker-lobbyff": "lobbyff", "umi-lobbyff": "lobbyff", "umi-fflobby": "fflobby", "umi-freefirelobby": "freefirelobby", "lobbyff": "lobbyff", "fflobby": "fflobby", "freefirelobby": "freefirelobby"}, "description": "Membuat gambar lobby Free Fire dengan 22 template Aqua", "usage": ".lobbyff <1-22|random>|<nama>", "example": ".lobbyff random|Jagoan FF", "cooldown": 15, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/lobbyff.js", metadata, m, extra)
handler.help = ["umi-maker-lobbyff <1-22|random>|<nama>"]
handler.command = ["umi-maker-lobbyff", "umi-lobbyff", "umi-fflobby", "umi-freefirelobby", "lobbyff", "fflobby", "freefirelobby"]
handler.tags = ["maker"]
handler.description = "Membuat gambar lobby Free Fire dengan 22 template Aqua"
handler.importSource = "umi"
handler.importConfig = {"name": "lobbyff", "alias": ["fflobby", "freefirelobby"], "category": "maker", "description": "Membuat gambar lobby Free Fire dengan 22 template Aqua", "usage": ".lobbyff <1-22|random>|<nama>", "example": ".lobbyff random|Jagoan FF", "isPremium": false, "cooldown": 15, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-lobbyff": "lobbyff", "umi-lobbyff": "lobbyff", "umi-fflobby": "fflobby", "umi-freefirelobby": "freefirelobby", "lobbyff": "lobbyff", "fflobby": "fflobby", "freefirelobby": "freefirelobby"}
export default handler
