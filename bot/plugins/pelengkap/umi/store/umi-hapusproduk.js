import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hapusproduk", "category": "store", "aliasMap": {"umi-store-hapusproduk": "hapusproduk", "umi-hapusproduk": "hapusproduk", "umi-delproduk": "delproduk", "umi-delproduct": "delproduct", "umi-deleteproduk": "deleteproduk", "hapusproduk": "hapusproduk", "delproduk": "delproduk", "delproduct": "delproduct", "deleteproduk": "deleteproduk"}, "description": "🗑️ Hapus produk dari toko", "usage": ".hapusproduk <nomor>", "example": ".hapusproduk 1", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/hapusproduk.js", metadata, m, extra)
handler.help = ["umi-store-hapusproduk <nomor>"]
handler.command = ["umi-store-hapusproduk", "umi-hapusproduk", "umi-delproduk", "umi-delproduct", "umi-deleteproduk", "hapusproduk", "delproduk", "delproduct", "deleteproduk"]
handler.tags = ["store"]
handler.description = "🗑️ Hapus produk dari toko"
handler.importSource = "umi"
handler.importConfig = {"name": "hapusproduk", "alias": ["delproduk", "delproduct", "deleteproduk"], "category": "store", "description": "🗑️ Hapus produk dari toko", "usage": ".hapusproduk <nomor>", "example": ".hapusproduk 1", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-hapusproduk": "hapusproduk", "umi-hapusproduk": "hapusproduk", "umi-delproduk": "delproduk", "umi-delproduct": "delproduct", "umi-deleteproduk": "deleteproduk", "hapusproduk": "hapusproduk", "delproduk": "delproduk", "delproduct": "delproduct", "deleteproduk": "deleteproduk"}
export default handler
