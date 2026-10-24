/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "livescore", "category": "info", "aliasMap": {"umi-info-livescore": "livescore", "umi-livescore": "livescore", "umi-skorbola": "skorbola", "umi-livebola": "livebola", "umi-skor": "skor", "livescore": "livescore", "skorbola": "skorbola", "livebola": "livebola", "skor": "skor"}, "description": "Menampilkan live score pertandingan sepak bola dari Goal.com", "usage": ".livescore", "example": ".livescore", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/livescore.js", metadata, m, extra)
handler.help = ["umi-info-livescore"]
handler.command = ["umi-info-livescore", "umi-livescore", "umi-skorbola", "umi-livebola", "umi-skor", "livescore", "skorbola", "livebola", "skor"]
handler.tags = ["info"]
handler.description = "Menampilkan live score pertandingan sepak bola dari Goal.com"
handler.importSource = "umi"
handler.importConfig = {"name": "livescore", "alias": ["skorbola", "livebola", "skor"], "category": "info", "description": "Menampilkan live score pertandingan sepak bola dari Goal.com", "usage": ".livescore", "example": ".livescore", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-livescore": "livescore", "umi-livescore": "livescore", "umi-skorbola": "skorbola", "umi-livebola": "livebola", "umi-skor": "skor", "livescore": "livescore", "skorbola": "skorbola", "livebola": "livebola", "skor": "skor"}
export default handler
