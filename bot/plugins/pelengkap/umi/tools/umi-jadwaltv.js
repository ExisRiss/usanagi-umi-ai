import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jadwaltv", "category": "tools", "aliasMap": {"umi-tools-jadwaltv": "jadwaltv", "umi-jadwaltv": "jadwaltv", "jadwaltv": "jadwaltv"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/jadwaltv.js", metadata, m, extra)
handler.help = ["umi-tools-jadwaltv"]
handler.command = ["umi-tools-jadwaltv", "umi-jadwaltv", "jadwaltv"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "jadwaltv", "alias": [], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-jadwaltv": "jadwaltv", "umi-jadwaltv": "jadwaltv", "jadwaltv": "jadwaltv"}
export default handler
