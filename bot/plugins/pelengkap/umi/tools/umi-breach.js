import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "breach", "category": "tools", "aliasMap": {"umi-tools-breach": "breach", "umi-breach": "breach", "breach": "breach"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/breach.js", metadata, m, extra)
handler.help = ["umi-tools-breach"]
handler.command = ["umi-tools-breach", "umi-breach", "breach"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "breach", "alias": [], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-breach": "breach", "umi-breach": "breach", "breach": "breach"}
export default handler
