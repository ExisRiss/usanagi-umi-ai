import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hargapanel", "category": "main", "aliasMap": {"umi-main-hargapanel": "hargapanel", "umi-hargapanel": "hargapanel", "umi-sethargapanel": "sethargapanel", "hargapanel": "hargapanel", "sethargapanel": "sethargapanel"}, "description": "Menampilkan dan mengatur daftar harga sewa/beli panel", "usage": ".hargapanel / .sethargapanel <teks>", "example": ".sethargapanel RAM 1GB = 1k", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/hargapanel.js", metadata, m, extra)
handler.help = ["umi-main-hargapanel / .sethargapanel <teks>"]
handler.command = ["umi-main-hargapanel", "umi-hargapanel", "umi-sethargapanel", "hargapanel", "sethargapanel"]
handler.tags = ["main"]
handler.description = "Menampilkan dan mengatur daftar harga sewa/beli panel"
handler.importSource = "umi"
handler.importConfig = {"name": "hargapanel", "alias": ["sethargapanel"], "category": "main", "description": "Menampilkan dan mengatur daftar harga sewa/beli panel", "usage": ".hargapanel / .sethargapanel <teks>", "example": ".sethargapanel RAM 1GB = 1k", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-main-hargapanel": "hargapanel", "umi-hargapanel": "hargapanel", "umi-sethargapanel": "sethargapanel", "hargapanel": "hargapanel", "sethargapanel": "sethargapanel"}
export default handler
