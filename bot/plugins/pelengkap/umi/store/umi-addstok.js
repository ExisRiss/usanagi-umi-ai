/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addstok", "category": "store", "aliasMap": {"umi-store-addstok": "addstok", "umi-addstok": "addstok", "umi-addstock": "addstock", "umi-importstok": "importstok", "umi-importstock": "importstock", "addstok": "addstok", "addstock": "addstock", "importstok": "importstok", "importstock": "importstock"}, "description": "📦 Tambah stok item ke produk (hanya di private chat)", "usage": ".addstok <nomor_produk>|<detail> atau .addstok <nomor> <jumlah> (fisik)", "example": ".addstok 1|Email: user@mail.com;;Password: pass123", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/addstok.js", metadata, m, extra)
handler.help = ["umi-store-addstok <nomor_produk>|<detail> atau .addstok <nomor> <jumlah> (fisik)"]
handler.command = ["umi-store-addstok", "umi-addstok", "umi-addstock", "umi-importstok", "umi-importstock", "addstok", "addstock", "importstok", "importstock"]
handler.tags = ["store"]
handler.description = "📦 Tambah stok item ke produk (hanya di private chat)"
handler.importSource = "umi"
handler.importConfig = {"name": "addstok", "alias": ["addstock", "importstok", "importstock"], "category": "store", "description": "📦 Tambah stok item ke produk (hanya di private chat)", "usage": ".addstok <nomor_produk>|<detail> atau .addstok <nomor> <jumlah> (fisik)", "example": ".addstok 1|Email: user@mail.com;;Password: pass123", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-addstok": "addstok", "umi-addstok": "addstok", "umi-addstock": "addstock", "umi-importstok": "importstok", "umi-importstock": "importstock", "addstok": "addstok", "addstock": "addstock", "importstok": "importstok", "importstock": "importstock"}
export default handler
