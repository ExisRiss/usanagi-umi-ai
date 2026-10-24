import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tran", "category": "tools", "aliasMap": {"umi-tools-tran": "tran", "umi-tran": "tran", "umi-slate": "slate", "umi-tr": "tr"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/translate.js", metadata, m, extra)
handler.help = ["umi-tools-tran"]
handler.command = ["umi-tools-tran", "umi-tran", "umi-slate", "umi-tr"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "tran", "alias": ["slate", "tr"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-tran": "tran", "umi-tran": "tran", "umi-slate": "slate", "umi-tr": "tr"}
export default handler
