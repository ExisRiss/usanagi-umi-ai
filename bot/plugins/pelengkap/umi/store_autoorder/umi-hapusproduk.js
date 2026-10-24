import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autohapusproduk", "category": "store_autoorder", "aliasMap": {"umi-store_autoorder-autohapusproduk": "autohapusproduk", "umi-autohapusproduk": "autohapusproduk", "umi-autodelproduk": "autodelproduk", "autohapusproduk": "autohapusproduk", "autodelproduk": "autodelproduk"}, "description": "🛍️ Menghapus produk dari autoorder store", "usage": ".autohapusproduk <id_produk/nomor>", "example": ".autohapusproduk 1", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store_autoorder/hapusproduk.js", metadata, m, extra)
handler.help = ["umi-store_autoorder-autohapusproduk <id_produk/nomor>"]
handler.command = ["umi-store_autoorder-autohapusproduk", "umi-autohapusproduk", "umi-autodelproduk", "autohapusproduk", "autodelproduk"]
handler.tags = ["store_autoorder"]
handler.description = "🛍️ Menghapus produk dari autoorder store"
handler.importSource = "umi"
handler.importConfig = {"name": "autohapusproduk", "alias": ["autodelproduk"], "category": "store_autoorder", "description": "🛍️ Menghapus produk dari autoorder store", "usage": ".autohapusproduk <id_produk/nomor>", "example": ".autohapusproduk 1", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store_autoorder-autohapusproduk": "autohapusproduk", "umi-autohapusproduk": "autohapusproduk", "umi-autodelproduk": "autodelproduk", "autohapusproduk": "autohapusproduk", "autodelproduk": "autodelproduk"}
export default handler
