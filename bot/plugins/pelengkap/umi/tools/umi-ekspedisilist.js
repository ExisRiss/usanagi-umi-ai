import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ekspedisilist", "category": "tools", "aliasMap": {"umi-tools-ekspedisilist": "ekspedisilist", "umi-ekspedisilist": "ekspedisilist", "ekspedisilist": "ekspedisilist"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ekspedisilist.js", metadata, m, extra)
handler.help = ["umi-tools-ekspedisilist"]
handler.command = ["umi-tools-ekspedisilist", "umi-ekspedisilist", "ekspedisilist"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ekspedisilist", "alias": [], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-ekspedisilist": "ekspedisilist", "umi-ekspedisilist": "ekspedisilist", "ekspedisilist": "ekspedisilist"}
export default handler
