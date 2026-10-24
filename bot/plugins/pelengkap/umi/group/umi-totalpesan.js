import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "totalpesan", "category": "group", "aliasMap": {"umi-group-totalpesan": "totalpesan", "umi-totalpesan": "totalpesan"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/totalpesan.js", metadata, m, extra)
handler.help = ["umi-group-totalpesan"]
handler.command = ["umi-group-totalpesan", "umi-totalpesan"]
handler.tags = ["group"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "totalpesan", "alias": [], "category": "group", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-group-totalpesan": "totalpesan", "umi-totalpesan": "totalpesan"}
export default handler
