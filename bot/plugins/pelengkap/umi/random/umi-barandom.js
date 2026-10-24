import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "barandom", "category": "random", "aliasMap": {"umi-random-barandom": "barandom", "umi-barandom": "barandom", "umi-bluearchive": "bluearchive", "umi-ba": "ba", "barandom": "barandom", "ba": "ba"}, "description": "Random gambar Blue Archive", "usage": ".barandom", "example": ".barandom", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/barandom.js", metadata, m, extra)
handler.help = ["umi-random-barandom"]
handler.command = ["umi-random-barandom", "umi-barandom", "umi-bluearchive", "umi-ba", "barandom", "ba"]
handler.tags = ["random"]
handler.description = "Random gambar Blue Archive"
handler.importSource = "umi"
handler.importConfig = {"name": "barandom", "alias": ["bluearchive", "ba"], "category": "random", "description": "Random gambar Blue Archive", "usage": ".barandom", "example": ".barandom", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-barandom": "barandom", "umi-barandom": "barandom", "umi-bluearchive": "bluearchive", "umi-ba": "ba", "barandom": "barandom", "ba": "ba"}
export default handler
