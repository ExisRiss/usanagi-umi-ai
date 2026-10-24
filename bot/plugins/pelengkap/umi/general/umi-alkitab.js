import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "alkitab", "category": "general", "aliasMap": {"umi-general-alkitab": "alkitab", "umi-alkitab": "alkitab", "alkitab": "alkitab"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/alkitab.js", metadata, m, extra)
handler.help = ["umi-general-alkitab"]
handler.command = ["umi-general-alkitab", "umi-alkitab", "alkitab"]
handler.tags = ["general"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "alkitab", "alias": [], "category": "general", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-general-alkitab": "alkitab", "umi-alkitab": "alkitab", "alkitab": "alkitab"}
export default handler
