import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sawer", "category": "rpg", "aliasMap": {"umi-rpg-sawer": "sawer", "umi-sawer": "sawer", "umi-nyawer": "nyawer", "sawer": "sawer", "nyawer": "nyawer"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/sawer.js", metadata, m, extra)
handler.help = ["umi-rpg-sawer"]
handler.command = ["umi-rpg-sawer", "umi-sawer", "umi-nyawer", "sawer", "nyawer"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "sawer", "alias": ["nyawer"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-sawer": "sawer", "umi-sawer": "sawer", "umi-nyawer": "nyawer", "sawer": "sawer", "nyawer": "nyawer"}
export default handler
