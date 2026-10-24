/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listproduk", "category": "store", "aliasMap": {"umi-store-listproduk": "listproduk", "umi-listproduk": "listproduk", "umi-produk": "produk", "umi-katalog": "katalog", "umi-catalog": "catalog", "listproduk": "listproduk", "produk": "produk", "katalog": "katalog", "catalog": "catalog"}, "description": "🛍️ Lihat daftar produk yang tersedia", "usage": ".listproduk", "example": ".listproduk", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/listproduk.js", metadata, m, extra)
handler.help = ["umi-store-listproduk"]
handler.command = ["umi-store-listproduk", "umi-listproduk", "umi-produk", "umi-katalog", "umi-catalog", "listproduk", "produk", "katalog", "catalog"]
handler.tags = ["store"]
handler.description = "🛍️ Lihat daftar produk yang tersedia"
handler.importSource = "umi"
handler.importConfig = {"name": "listproduk", "alias": ["produk", "katalog", "catalog"], "category": "store", "description": "🛍️ Lihat daftar produk yang tersedia", "usage": ".listproduk", "example": ".listproduk", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-listproduk": "listproduk", "umi-listproduk": "listproduk", "umi-produk": "produk", "umi-katalog": "katalog", "umi-catalog": "catalog", "listproduk": "listproduk", "produk": "produk", "katalog": "katalog", "catalog": "catalog"}
export default handler
