/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "credit", "category": "main", "aliasMap": {"umi-main-credit": "credit", "umi-credit": "credit", "credit": "credit"}, "description": "Menampilkan credit Umi MD.", "usage": ".credit", "example": ".credit", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/credit.js", metadata, m, extra)
handler.help = ["umi-main-credit"]
handler.command = ["umi-main-credit", "umi-credit", "credit"]
handler.tags = ["main"]
handler.description = "Menampilkan credit Umi MD."
handler.importSource = "umi"
handler.importConfig = {"name": "credit", "alias": [], "category": "main", "description": "Menampilkan credit Umi MD.", "usage": ".credit", "example": ".credit", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-credit": "credit", "umi-credit": "credit", "credit": "credit"}
export default handler
