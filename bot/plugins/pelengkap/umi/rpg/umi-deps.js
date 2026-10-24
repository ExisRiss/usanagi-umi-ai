import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "deps", "category": "rpg", "aliasMap": {"umi-rpg-deps": "deps", "umi-deps": "deps", "deps": "deps"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/deps.js", metadata, m, extra)
handler.help = ["umi-rpg-deps"]
handler.command = ["umi-rpg-deps", "umi-deps", "deps"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "deps", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-deps": "deps", "umi-deps": "deps", "deps": "deps"}
export default handler
