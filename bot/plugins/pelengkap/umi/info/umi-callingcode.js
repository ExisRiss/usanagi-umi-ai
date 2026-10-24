import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "callingcode", "category": "info", "aliasMap": {"umi-info-callingcode": "callingcode", "umi-callingcode": "callingcode", "callingcode": "callingcode"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/callingcode.js", metadata, m, extra)
handler.help = ["umi-info-callingcode"]
handler.command = ["umi-info-callingcode", "umi-callingcode", "callingcode"]
handler.tags = ["info"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "callingcode", "alias": [], "category": "info", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-callingcode": "callingcode", "umi-callingcode": "callingcode", "callingcode": "callingcode"}
export default handler
