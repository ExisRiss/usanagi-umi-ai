/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sc", "category": "main", "aliasMap": {"umi-main-sc": "sc", "umi-sc": "sc", "umi-script": "script"}, "description": "Link script bot wa terbaru", "usage": ".sc", "example": ".sc", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/sc.js", metadata, m, extra)
handler.help = ["umi-main-sc"]
handler.command = ["umi-main-sc", "umi-sc", "umi-script"]
handler.tags = ["main"]
handler.description = "Link script bot wa terbaru"
handler.importSource = "umi"
handler.importConfig = {"name": "sc", "alias": ["script"], "category": "main", "description": "Link script bot wa terbaru", "usage": ".sc", "example": ".sc", "isPremium": false, "isOwner": false, "isBanned": false, "isAdmin": false, "cooldown": 10, "energi": 0, "isBotAdmin": false, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-sc": "sc", "umi-sc": "sc", "umi-script": "script"}
export default handler
