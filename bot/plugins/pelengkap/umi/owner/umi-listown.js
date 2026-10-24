import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listown", "category": "owner", "aliasMap": {"umi-owner-listown": "listown", "umi-listown": "listown", "umi-er": "er", "umi-ers": "ers", "listown": "listown", "er": "er", "ers": "ers"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/listown.js", metadata, m, extra)
handler.help = ["umi-owner-listown"]
handler.command = ["umi-owner-listown", "umi-listown", "umi-er", "umi-ers", "listown", "er", "ers"]
handler.tags = ["owner"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "listown", "alias": ["er", "ers"], "category": "owner", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-owner-listown": "listown", "umi-listown": "listown", "umi-er": "er", "umi-ers": "ers", "listown": "listown", "er": "er", "ers": "ers"}
export default handler
