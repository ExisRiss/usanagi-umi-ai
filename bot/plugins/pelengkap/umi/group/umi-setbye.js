import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setbye", "category": "group", "aliasMap": {"umi-group-setbye": "setbye", "umi-setbye": "setbye"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/setbye.js", metadata, m, extra)
handler.help = ["umi-group-setbye"]
handler.command = ["umi-group-setbye", "umi-setbye"]
handler.tags = ["group"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "setbye", "alias": [], "category": "group", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-group-setbye": "setbye", "umi-setbye": "setbye"}
export default handler
