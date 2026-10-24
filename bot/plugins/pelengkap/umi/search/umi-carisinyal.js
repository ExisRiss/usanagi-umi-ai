import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "spekhp", "category": "search", "aliasMap": {"umi-search-spekhp": "spekhp", "umi-spekhp": "spekhp", "umi-spek": "spek", "umi-spesifikasi": "spesifikasi", "spekhp": "spekhp", "spek": "spek", "spesifikasi": "spesifikasi"}, "description": "Mencari spesifikasi lengkap smartphone dari Carisinyal.", "usage": ".spekhp <nama hp>", "example": ".spekhp oppo a3s", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/carisinyal.js", metadata, m, extra)
handler.help = ["umi-search-spekhp <nama hp>"]
handler.command = ["umi-search-spekhp", "umi-spekhp", "umi-spek", "umi-spesifikasi", "spekhp", "spek", "spesifikasi"]
handler.tags = ["search"]
handler.description = "Mencari spesifikasi lengkap smartphone dari Carisinyal."
handler.importSource = "umi"
handler.importConfig = {"name": "spekhp", "alias": ["spek", "spesifikasi"], "category": "search", "description": "Mencari spesifikasi lengkap smartphone dari Carisinyal.", "usage": ".spekhp <nama hp>", "example": ".spekhp oppo a3s", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-spekhp": "spekhp", "umi-spekhp": "spekhp", "umi-spek": "spek", "umi-spesifikasi": "spesifikasi", "spekhp": "spekhp", "spek": "spek", "spesifikasi": "spesifikasi"}
export default handler
