import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addpremall", "category": "owner", "aliasMap": {"umi-owner-addpremall": "addpremall", "umi-addpremall": "addpremall", "umi-addpremiumall": "addpremiumall", "umi-setpremall": "setpremall", "addpremall": "addpremall", "addpremiumall": "addpremiumall", "setpremall": "setpremall"}, "description": "Menambahkan semua member grup ke premium", "usage": ".addprem all", "example": ".addprem all", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addpremall.js", metadata, m, extra)
handler.help = ["umi-owner-addpremall all"]
handler.command = ["umi-owner-addpremall", "umi-addpremall", "umi-addpremiumall", "umi-setpremall", "addpremall", "addpremiumall", "setpremall"]
handler.tags = ["owner"]
handler.description = "Menambahkan semua member grup ke premium"
handler.importSource = "umi"
handler.importConfig = {"name": "addpremall", "alias": ["addpremiumall", "setpremall"], "category": "owner", "description": "Menambahkan semua member grup ke premium", "usage": ".addprem all", "example": ".addprem all", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addpremall": "addpremall", "umi-addpremall": "addpremall", "umi-addpremiumall": "addpremiumall", "umi-setpremall": "setpremall", "addpremall": "addpremall", "addpremiumall": "addpremiumall", "setpremall": "setpremall"}
export default handler
