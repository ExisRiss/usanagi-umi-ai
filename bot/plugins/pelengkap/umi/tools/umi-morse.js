import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "morse", "category": "tools", "aliasMap": {"umi-tools-morse": "morse", "umi-morse": "morse", "umi-demorse": "demorse", "morse": "morse", "demorse": "demorse"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/morse.js", metadata, m, extra)
handler.help = ["umi-tools-morse"]
handler.command = ["umi-tools-morse", "umi-morse", "umi-demorse", "morse", "demorse"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "morse", "alias": ["demorse"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-morse": "morse", "umi-morse": "morse", "umi-demorse": "demorse", "morse": "morse", "demorse": "demorse"}
export default handler
