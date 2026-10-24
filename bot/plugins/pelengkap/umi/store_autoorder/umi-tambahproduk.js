/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autotambahproduk", "category": "store_autoorder", "aliasMap": {"umi-store_autoorder-autotambahproduk": "autotambahproduk", "umi-autotambahproduk": "autotambahproduk", "umi-autoaddproduk": "autoaddproduk", "autotambahproduk": "autotambahproduk", "autoaddproduk": "autoaddproduk"}, "description": "🛍️ Menambah produk ke autoorder store", "usage": ".autotambahproduk <nama> | <harga> | <deskripsi>", "example": ".autotambahproduk Netflix 1 Bulan | 35000 | Akun sharing anti screen limit", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store_autoorder/tambahproduk.js", metadata, m, extra)
handler.help = ["umi-store_autoorder-autotambahproduk <nama> | <harga> | <deskripsi>"]
handler.command = ["umi-store_autoorder-autotambahproduk", "umi-autotambahproduk", "umi-autoaddproduk", "autotambahproduk", "autoaddproduk"]
handler.tags = ["store_autoorder"]
handler.description = "🛍️ Menambah produk ke autoorder store"
handler.importSource = "umi"
handler.importConfig = {"name": "autotambahproduk", "alias": ["autoaddproduk"], "category": "store_autoorder", "description": "🛍️ Menambah produk ke autoorder store", "usage": ".autotambahproduk <nama> | <harga> | <deskripsi>", "example": ".autotambahproduk Netflix 1 Bulan | 35000 | Akun sharing anti screen limit", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store_autoorder-autotambahproduk": "autotambahproduk", "umi-autotambahproduk": "autotambahproduk", "umi-autoaddproduk": "autoaddproduk", "autotambahproduk": "autotambahproduk", "autoaddproduk": "autoaddproduk"}
export default handler
