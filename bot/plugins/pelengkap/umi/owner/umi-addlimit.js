import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addlimit", "category": "owner", "aliasMap": {"umi-owner-addlimit": "addlimit", "umi-addlimit": "addlimit", "umi-user": "user"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addlimit.js", metadata, m, extra)
handler.help = ["umi-owner-addlimit"]
handler.command = ["umi-owner-addlimit", "umi-addlimit", "umi-user"]
handler.tags = ["owner"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "addlimit", "alias": ["user"], "category": "owner", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-owner-addlimit": "addlimit", "umi-addlimit": "addlimit", "umi-user": "user"}
export default handler
