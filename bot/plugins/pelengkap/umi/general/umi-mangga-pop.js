import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mangalist", "category": "general", "aliasMap": {"umi-general-mangalist": "mangalist", "umi-mangalist": "mangalist", "mangalist": "mangalist"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/mangga-pop.js", metadata, m, extra)
handler.help = ["umi-general-mangalist"]
handler.command = ["umi-general-mangalist", "umi-mangalist", "mangalist"]
handler.tags = ["general"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "mangalist", "alias": [], "category": "general", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-general-mangalist": "mangalist", "umi-mangalist": "mangalist", "mangalist": "mangalist"}
export default handler
