/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "checkban", "category": "owner", "aliasMap": {"umi-owner-checkban": "checkban", "umi-checkban": "checkban", "checkban": "checkban"}, "description": "Check actual ban state", "usage": ".checkban"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/checkban.js", metadata, m, extra)
handler.help = ["umi-owner-checkban"]
handler.command = ["umi-owner-checkban", "umi-checkban", "checkban"]
handler.tags = ["owner"]
handler.description = "Check actual ban state"
handler.importSource = "umi"
handler.importConfig = {"name": "checkban", "alias": [], "category": "owner", "description": "Check actual ban state", "usage": ".checkban", "isOwner": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-checkban": "checkban", "umi-checkban": "checkban", "checkban": "checkban"}
export default handler
