/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hargabot", "category": "main", "aliasMap": {"umi-main-hargabot": "hargabot", "umi-hargabot": "hargabot", "umi-sethargabot": "sethargabot", "hargabot": "hargabot", "sethargabot": "sethargabot"}, "description": "Menampilkan dan mengatur daftar harga sewa bot", "usage": ".hargabot / .sethargabot <teks>", "example": ".sethargabot 1 Hari = 1k", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/hargabot.js", metadata, m, extra)
handler.help = ["umi-main-hargabot / .sethargabot <teks>"]
handler.command = ["umi-main-hargabot", "umi-hargabot", "umi-sethargabot", "hargabot", "sethargabot"]
handler.tags = ["main"]
handler.description = "Menampilkan dan mengatur daftar harga sewa bot"
handler.importSource = "umi"
handler.importConfig = {"name": "hargabot", "alias": ["sethargabot"], "category": "main", "description": "Menampilkan dan mengatur daftar harga sewa bot", "usage": ".hargabot / .sethargabot <teks>", "example": ".sethargabot 1 Hari = 1k", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-main-hargabot": "hargabot", "umi-hargabot": "hargabot", "umi-sethargabot": "sethargabot", "hargabot": "hargabot", "sethargabot": "sethargabot"}
export default handler
