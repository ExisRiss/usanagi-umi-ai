import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mining", "category": "rpg", "aliasMap": {"umi-rpg-mining": "mining", "umi-mining": "mining", "umi-mine": "mine", "umi-tambang": "tambang"}, "description": "Menambang untuk mendapatkan ores dan gems", "usage": ".mining", "example": ".mining", "cooldown": 60, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/mining.js", metadata, m, extra)
handler.help = ["umi-rpg-mining"]
handler.command = ["umi-rpg-mining", "umi-mining", "umi-mine", "umi-tambang"]
handler.tags = ["rpg"]
handler.description = "Menambang untuk mendapatkan ores dan gems"
handler.importSource = "umi"
handler.importConfig = {"name": "mining", "alias": ["mine", "tambang"], "category": "rpg", "description": "Menambang untuk mendapatkan ores dan gems", "usage": ".mining", "example": ".mining", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-mining": "mining", "umi-mining": "mining", "umi-mine": "mine", "umi-tambang": "tambang"}
export default handler
