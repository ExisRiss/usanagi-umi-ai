import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "liststok", "category": "store", "aliasMap": {"umi-store-liststok": "liststok", "umi-liststok": "liststok", "umi-liststock": "liststock", "umi-stok": "stok", "umi-stock": "stock", "liststok": "liststok", "liststock": "liststock", "stok": "stok", "stock": "stock"}, "description": "📋 Lihat daftar stok item produk", "usage": ".liststok <nomor_produk>", "example": ".liststok 1", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/liststok.js", metadata, m, extra)
handler.help = ["umi-store-liststok <nomor_produk>"]
handler.command = ["umi-store-liststok", "umi-liststok", "umi-liststock", "umi-stok", "umi-stock", "liststok", "liststock", "stok", "stock"]
handler.tags = ["store"]
handler.description = "📋 Lihat daftar stok item produk"
handler.importSource = "umi"
handler.importConfig = {"name": "liststok", "alias": ["liststock", "stok", "stock"], "category": "store", "description": "📋 Lihat daftar stok item produk", "usage": ".liststok <nomor_produk>", "example": ".liststok 1", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-liststok": "liststok", "umi-liststok": "liststok", "umi-liststock": "liststock", "umi-stok": "stok", "umi-stock": "stock", "liststok": "liststok", "liststock": "liststock", "stok": "stok", "stock": "stock"}
export default handler
