import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delorder", "category": "store", "aliasMap": {"umi-store-delorder": "delorder", "umi-delorder": "delorder", "delorder": "delorder"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/delorder.js", metadata, m, extra)
handler.help = ["umi-store-delorder"]
handler.command = ["umi-store-delorder", "umi-delorder", "delorder"]
handler.tags = ["store"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "delorder", "alias": [], "category": "store", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-store-delorder": "delorder", "umi-delorder": "delorder", "delorder": "delorder"}
export default handler
