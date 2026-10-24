/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekkaya", "category": "cek", "aliasMap": {"umi-cek-cekkaya": "cekkaya", "umi-cekkaya": "cekkaya", "umi-kaya": "kaya", "umi-rich": "rich", "rich": "rich"}, "description": "Cek seberapa kaya kamu", "usage": ".cekkaya <nama>", "example": ".cekkaya Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekkaya.js", metadata, m, extra)
handler.help = ["umi-cek-cekkaya <nama>"]
handler.command = ["umi-cek-cekkaya", "umi-cekkaya", "umi-kaya", "umi-rich", "rich"]
handler.tags = ["cek"]
handler.description = "Cek seberapa kaya kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekkaya", "alias": ["kaya", "rich"], "category": "cek", "description": "Cek seberapa kaya kamu", "usage": ".cekkaya <nama>", "example": ".cekkaya Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekkaya": "cekkaya", "umi-cekkaya": "cekkaya", "umi-kaya": "kaya", "umi-rich": "rich", "rich": "rich"}
export default handler
