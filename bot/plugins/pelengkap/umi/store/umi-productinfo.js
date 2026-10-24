/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "productinfo", "category": "store", "aliasMap": {"umi-store-productinfo": "productinfo", "umi-productinfo": "productinfo", "umi-infoproduk": "infoproduk", "umi-detailproduk": "detailproduk", "productinfo": "productinfo", "infoproduk": "infoproduk", "detailproduk": "detailproduk"}, "description": "Lihat detail produk", "usage": ".productinfo <nomor>", "example": ".productinfo 1", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/productinfo.js", metadata, m, extra)
handler.help = ["umi-store-productinfo <nomor>"]
handler.command = ["umi-store-productinfo", "umi-productinfo", "umi-infoproduk", "umi-detailproduk", "productinfo", "infoproduk", "detailproduk"]
handler.tags = ["store"]
handler.description = "Lihat detail produk"
handler.importSource = "umi"
handler.importConfig = {"name": "productinfo", "alias": ["infoproduk", "detailproduk"], "category": "store", "description": "Lihat detail produk", "usage": ".productinfo <nomor>", "example": ".productinfo 1", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-productinfo": "productinfo", "umi-productinfo": "productinfo", "umi-infoproduk": "infoproduk", "umi-detailproduk": "detailproduk", "productinfo": "productinfo", "infoproduk": "infoproduk", "detailproduk": "detailproduk"}
export default handler
