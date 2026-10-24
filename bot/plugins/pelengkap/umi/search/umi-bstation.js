import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bstation", "category": "search", "aliasMap": {"umi-search-bstation": "bstation", "umi-bstation": "bstation", "umi-bili": "bili", "umi-bilibili": "bilibili", "bstation": "bstation"}, "description": "Cari video di Bilibili TV", "usage": ".bstation <query>", "example": ".bstation Oshi no ko", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/bstation.js", metadata, m, extra)
handler.help = ["umi-search-bstation <query>"]
handler.command = ["umi-search-bstation", "umi-bstation", "umi-bili", "umi-bilibili", "bstation"]
handler.tags = ["search"]
handler.description = "Cari video di Bilibili TV"
handler.importSource = "umi"
handler.importConfig = {"name": "bstation", "alias": ["bili", "bilibili"], "category": "search", "description": "Cari video di Bilibili TV", "usage": ".bstation <query>", "example": ".bstation Oshi no ko", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-bstation": "bstation", "umi-bstation": "bstation", "umi-bili": "bili", "umi-bilibili": "bilibili", "bstation": "bstation"}
export default handler
