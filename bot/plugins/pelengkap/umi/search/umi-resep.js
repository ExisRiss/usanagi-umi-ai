import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resep", "category": "search", "aliasMap": {"umi-search-resep": "resep", "umi-resep": "resep", "umi-resepmasak": "resepmasak", "umi-resepmasakan": "resepmasakan", "umi-caramasak": "caramasak", "resep": "resep", "resepmasak": "resepmasak", "resepmasakan": "resepmasakan", "caramasak": "caramasak"}, "description": "Cari resep makanan yang lengkap dan enak", "usage": ".resep <nama makanan>", "example": ".resep ayam geprek", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/resep.js", metadata, m, extra)
handler.help = ["umi-search-resep <nama makanan>"]
handler.command = ["umi-search-resep", "umi-resep", "umi-resepmasak", "umi-resepmasakan", "umi-caramasak", "resep", "resepmasak", "resepmasakan", "caramasak"]
handler.tags = ["search"]
handler.description = "Cari resep makanan yang lengkap dan enak"
handler.importSource = "umi"
handler.importConfig = {"name": "resep", "alias": ["resepmasak", "resepmasakan", "caramasak"], "category": "search", "description": "Cari resep makanan yang lengkap dan enak", "usage": ".resep <nama makanan>", "example": ".resep ayam geprek", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-resep": "resep", "umi-resep": "resep", "umi-resepmasak": "resepmasak", "umi-resepmasakan": "resepmasakan", "umi-caramasak": "caramasak", "resep": "resep", "resepmasak": "resepmasak", "resepmasakan": "resepmasakan", "caramasak": "caramasak"}
export default handler
