/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sewa2", "category": "main", "aliasMap": {"umi-main-sewa2": "sewa2", "umi-sewa2": "sewa2", "umi-premium2": "premium2", "sewa2": "sewa2", "premium2": "premium2"}, "description": "Varian paket sewa/premium dari Tensura.", "usage": ".sewa2 <kode>", "example": ".sewa2 <kode>", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/order2.js", metadata, m, extra)
handler.help = ["umi-main-sewa2 <kode>"]
handler.command = ["umi-main-sewa2", "umi-sewa2", "umi-premium2", "sewa2", "premium2"]
handler.tags = ["main"]
handler.description = "Varian paket sewa/premium dari Tensura."
handler.importSource = "umi"
handler.importConfig = {"name": "sewa2", "alias": ["premium2"], "category": "main", "description": "Varian paket sewa/premium dari Tensura.", "usage": ".sewa2 <kode>", "example": ".sewa2 <kode>", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-main-sewa2": "sewa2", "umi-sewa2": "sewa2", "umi-premium2": "premium2", "sewa2": "sewa2", "premium2": "premium2"}
export default handler
