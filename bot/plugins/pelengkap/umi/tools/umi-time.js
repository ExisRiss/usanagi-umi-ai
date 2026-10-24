/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "time", "category": "tools", "aliasMap": {"umi-tools-time": "time", "umi-time": "time", "umi-waktu": "waktu", "time": "time", "waktu": "waktu"}, "description": "Menampilkan waktu berdasarkan negara", "usage": ".time <negara>", "example": ".time Indonesia", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/time.js", metadata, m, extra)
handler.help = ["umi-tools-time <negara>"]
handler.command = ["umi-tools-time", "umi-time", "umi-waktu", "time", "waktu"]
handler.tags = ["tools"]
handler.description = "Menampilkan waktu berdasarkan negara"
handler.importSource = "umi"
handler.importConfig = {"name": "time", "alias": ["waktu"], "category": "tools", "description": "Menampilkan waktu berdasarkan negara", "usage": ".time <negara>", "example": ".time Indonesia", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-time": "time", "umi-time": "time", "umi-waktu": "waktu", "time": "time", "waktu": "waktu"}
export default handler
