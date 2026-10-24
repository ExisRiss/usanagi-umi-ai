/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tagadmin", "category": "group", "aliasMap": {"umi-group-tagadmin": "tagadmin", "umi-tagadmin": "tagadmin", "tagadmin": "tagadmin"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/tagadmin.js", metadata, m, extra)
handler.help = ["umi-group-tagadmin"]
handler.command = ["umi-group-tagadmin", "umi-tagadmin", "tagadmin"]
handler.tags = ["group"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "tagadmin", "alias": [], "category": "group", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-group-tagadmin": "tagadmin", "umi-tagadmin": "tagadmin", "tagadmin": "tagadmin"}
export default handler
