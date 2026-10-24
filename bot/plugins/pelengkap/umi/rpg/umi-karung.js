import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "karung", "category": "rpg", "aliasMap": {"umi-rpg-karung": "karung", "umi-karung": "karung", "karung": "karung"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/karung.js", metadata, m, extra)
handler.help = ["umi-rpg-karung"]
handler.command = ["umi-rpg-karung", "umi-karung", "karung"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "karung", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-karung": "karung", "umi-karung": "karung", "karung": "karung"}
export default handler
