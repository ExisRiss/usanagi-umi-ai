import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delpremall", "category": "owner", "aliasMap": {"umi-owner-delpremall": "delpremall", "umi-delpremall": "delpremall", "umi-delpremiumall": "delpremiumall", "umi-removepremall": "removepremall", "delpremall": "delpremall", "delpremiumall": "delpremiumall", "removepremall": "removepremall"}, "description": "Menghapus semua member grup dari premium", "usage": ".delprem all", "example": ".delprem all", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/delpremall.js", metadata, m, extra)
handler.help = ["umi-owner-delpremall all"]
handler.command = ["umi-owner-delpremall", "umi-delpremall", "umi-delpremiumall", "umi-removepremall", "delpremall", "delpremiumall", "removepremall"]
handler.tags = ["owner"]
handler.description = "Menghapus semua member grup dari premium"
handler.importSource = "umi"
handler.importConfig = {"name": "delpremall", "alias": ["delpremiumall", "removepremall"], "category": "owner", "description": "Menghapus semua member grup dari premium", "usage": ".delprem all", "example": ".delprem all", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-delpremall": "delpremall", "umi-delpremall": "delpremall", "umi-delpremiumall": "delpremiumall", "umi-removepremall": "removepremall", "delpremall": "delpremall", "delpremiumall": "delpremiumall", "removepremall": "removepremall"}
export default handler
