import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetlimit", "category": "main", "aliasMap": {"umi-main-resetlimit": "resetlimit", "umi-resetlimit": "resetlimit"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/resetlimit.js", metadata, m, extra)
handler.help = ["umi-main-resetlimit"]
handler.command = ["umi-main-resetlimit", "umi-resetlimit"]
handler.tags = ["main"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "resetlimit", "alias": [], "category": "main", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-main-resetlimit": "resetlimit", "umi-resetlimit": "resetlimit"}
export default handler
