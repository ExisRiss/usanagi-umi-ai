import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "reedem", "category": "rpg", "aliasMap": {"umi-rpg-reedem": "reedem", "umi-reedem": "reedem", "reedem": "reedem"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/reedem.js", metadata, m, extra)
handler.help = ["umi-rpg-reedem"]
handler.command = ["umi-rpg-reedem", "umi-reedem", "reedem"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "reedem", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-reedem": "reedem", "umi-reedem": "reedem", "reedem": "reedem"}
export default handler
