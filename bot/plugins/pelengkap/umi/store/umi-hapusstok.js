import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hapusstok", "category": "store", "aliasMap": {"umi-store-hapusstok": "hapusstok", "umi-hapusstok": "hapusstok", "umi-delstok": "delstok", "umi-delstock": "delstock", "umi-deletestok": "deletestok", "hapusstok": "hapusstok", "delstok": "delstok", "delstock": "delstock", "deletestok": "deletestok"}, "description": "🗑️ Hapus stok item dari produk", "usage": ".hapusstok <nomor_produk> <nomor_item>", "example": ".hapusstok 1 3", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/hapusstok.js", metadata, m, extra)
handler.help = ["umi-store-hapusstok <nomor_produk> <nomor_item>"]
handler.command = ["umi-store-hapusstok", "umi-hapusstok", "umi-delstok", "umi-delstock", "umi-deletestok", "hapusstok", "delstok", "delstock", "deletestok"]
handler.tags = ["store"]
handler.description = "🗑️ Hapus stok item dari produk"
handler.importSource = "umi"
handler.importConfig = {"name": "hapusstok", "alias": ["delstok", "delstock", "deletestok"], "category": "store", "description": "🗑️ Hapus stok item dari produk", "usage": ".hapusstok <nomor_produk> <nomor_item>", "example": ".hapusstok 1 3", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-hapusstok": "hapusstok", "umi-hapusstok": "hapusstok", "umi-delstok": "delstok", "umi-delstock": "delstock", "umi-deletestok": "deletestok", "hapusstok": "hapusstok", "delstok": "delstok", "delstock": "delstock", "deletestok": "deletestok"}
export default handler
