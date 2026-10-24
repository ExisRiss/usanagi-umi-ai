import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "beli", "category": "store", "aliasMap": {"umi-store-beli": "beli", "umi-order": "order", "umi-pesan": "pesan", "order": "order", "pesan": "pesan"}, "description": "🛒 Pesan produk dan dapatkan nomor transaksi", "usage": ".beli <nomor_produk>", "example": ".beli 1", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/beli.js", metadata, m, extra)
handler.help = ["umi-store-beli <nomor_produk>"]
handler.command = ["umi-store-beli", "umi-order", "umi-pesan", "order", "pesan"]
handler.tags = ["store"]
handler.description = "🛒 Pesan produk dan dapatkan nomor transaksi"
handler.importSource = "umi"
handler.importConfig = {"name": "beli", "alias": ["order", "pesan", "buy"], "category": "store", "description": "🛒 Pesan produk dan dapatkan nomor transaksi", "usage": ".beli <nomor_produk>", "example": ".beli 1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-beli": "beli", "umi-order": "order", "umi-pesan": "pesan", "order": "order", "pesan": "pesan"}
export default handler
