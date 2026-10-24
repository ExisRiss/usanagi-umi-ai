import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "done", "category": "store", "aliasMap": {"umi-store-done": "done", "umi-done": "done", "umi-selesai": "selesai", "umi-confirm": "confirm", "done": "done", "selesai": "selesai", "confirm": "confirm"}, "description": "✅ Konfirmasi transaksi selesai dan kirim data ke pembeli (reply pesan pembeli)", "usage": ".done <nomor_trx> (reply pesan pembeli)", "example": ".done TRX-001", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/done.js", metadata, m, extra)
handler.help = ["umi-store-done <nomor_trx> (reply pesan pembeli)"]
handler.command = ["umi-store-done", "umi-done", "umi-selesai", "umi-confirm", "done", "selesai", "confirm"]
handler.tags = ["store"]
handler.description = "✅ Konfirmasi transaksi selesai dan kirim data ke pembeli (reply pesan pembeli)"
handler.importSource = "umi"
handler.importConfig = {"name": "done", "alias": ["selesai", "kirim", "confirm"], "category": "store", "description": "✅ Konfirmasi transaksi selesai dan kirim data ke pembeli (reply pesan pembeli)", "usage": ".done <nomor_trx> (reply pesan pembeli)", "example": ".done TRX-001", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-done": "done", "umi-done": "done", "umi-selesai": "selesai", "umi-confirm": "confirm", "done": "done", "selesai": "selesai", "confirm": "confirm"}
export default handler
