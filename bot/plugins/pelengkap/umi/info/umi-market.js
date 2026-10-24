import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "market", "category": "info", "aliasMap": {"umi-info-market": "market", "umi-market": "market"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/market.js", metadata, m, extra)
handler.help = ["umi-info-market"]
handler.command = ["umi-info-market", "umi-market"]
handler.tags = ["info"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "market", "alias": [], "category": "info", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-market": "market", "umi-market": "market"}
export default handler
