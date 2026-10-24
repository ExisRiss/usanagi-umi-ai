/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "beliproduk", "category": "store", "aliasMap": {"umi-store-beliproduk": "beliproduk", "umi-beliproduk": "beliproduk", "umi-buyproduk": "buyproduk", "umi-belisaldo": "belisaldo", "umi-buywithkoin": "buywithkoin", "umi-ordersaldo": "ordersaldo", "beliproduk": "beliproduk", "buyproduk": "buyproduk", "belisaldo": "belisaldo", "buywithkoin": "buywithkoin", "ordersaldo": "ordersaldo"}, "description": "Beli produk dengan saldo/koin", "usage": ".beliproduk [nomor_produk] [jumlah]", "example": ".beliproduk 1", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/buy.js", metadata, m, extra)
handler.help = ["umi-store-beliproduk [nomor_produk] [jumlah]"]
handler.command = ["umi-store-beliproduk", "umi-beliproduk", "umi-buyproduk", "umi-belisaldo", "umi-buywithkoin", "umi-ordersaldo", "beliproduk", "buyproduk", "belisaldo", "buywithkoin", "ordersaldo"]
handler.tags = ["store"]
handler.description = "Beli produk dengan saldo/koin"
handler.importSource = "umi"
handler.importConfig = {"name": "beliproduk", "alias": ["buyproduk", "belisaldo", "buywithkoin", "ordersaldo"], "category": "store", "description": "Beli produk dengan saldo/koin", "usage": ".beliproduk [nomor_produk] [jumlah]", "example": ".beliproduk 1", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-beliproduk": "beliproduk", "umi-beliproduk": "beliproduk", "umi-buyproduk": "buyproduk", "umi-belisaldo": "belisaldo", "umi-buywithkoin": "buywithkoin", "umi-ordersaldo": "ordersaldo", "beliproduk": "beliproduk", "buyproduk": "buyproduk", "belisaldo": "belisaldo", "buywithkoin": "buywithkoin", "ordersaldo": "ordersaldo"}
export default handler
