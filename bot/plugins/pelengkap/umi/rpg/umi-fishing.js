import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fishing", "category": "rpg", "aliasMap": {"umi-rpg-fishing": "fishing", "umi-fishing": "fishing", "umi-rpgfish": "rpgfish", "umi-mancing": "mancing"}, "description": "Memancing untuk mendapatkan ikan (RPG)", "usage": ".fishing", "example": ".fishing", "cooldown": 60, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/fishing.js", metadata, m, extra)
handler.help = ["umi-rpg-fishing"]
handler.command = ["umi-rpg-fishing", "umi-fishing", "umi-rpgfish", "umi-mancing"]
handler.tags = ["rpg"]
handler.description = "Memancing untuk mendapatkan ikan (RPG)"
handler.importSource = "umi"
handler.importConfig = {"name": "fishing", "alias": ["rpgfish", "mancing"], "category": "rpg", "description": "Memancing untuk mendapatkan ikan (RPG)", "usage": ".fishing", "example": ".fishing", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-fishing": "fishing", "umi-fishing": "fishing", "umi-rpgfish": "rpgfish", "umi-mancing": "mancing"}
export default handler
