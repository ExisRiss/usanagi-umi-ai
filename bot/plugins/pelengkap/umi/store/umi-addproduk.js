/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addproduk", "category": "store", "aliasMap": {"umi-store-addproduk": "addproduk", "umi-addproduk": "addproduk", "umi-addproduct": "addproduct", "addproduk": "addproduk", "addproduct": "addproduct"}, "description": "➕ Tambah produk baru ke toko (hanya di private chat)", "usage": ".addproduk <nama>|<harga>|<tipe>|<stok>|<deskripsi>", "example": ".addproduk Spotify Premium|25000|digital|10|Akun Premium 1 Bulan", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/addproduk.js", metadata, m, extra)
handler.help = ["umi-store-addproduk <nama>|<harga>|<tipe>|<stok>|<deskripsi>"]
handler.command = ["umi-store-addproduk", "umi-addproduk", "umi-addproduct", "addproduk", "addproduct"]
handler.tags = ["store"]
handler.description = "➕ Tambah produk baru ke toko (hanya di private chat)"
handler.importSource = "umi"
handler.importConfig = {"name": "addproduk", "alias": ["addproduct"], "category": "store", "description": "➕ Tambah produk baru ke toko (hanya di private chat)", "usage": ".addproduk <nama>|<harga>|<tipe>|<stok>|<deskripsi>", "example": ".addproduk Spotify Premium|25000|digital|10|Akun Premium 1 Bulan", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-addproduk": "addproduk", "umi-addproduk": "addproduk", "umi-addproduct": "addproduct", "addproduk": "addproduk", "addproduct": "addproduct"}
export default handler
