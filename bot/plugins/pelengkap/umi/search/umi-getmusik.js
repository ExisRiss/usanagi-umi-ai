/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "getmusik", "category": "search", "aliasMap": {"umi-search-getmusik": "getmusik", "umi-getmusik": "getmusik", "umi-dlmusik": "dlmusik", "umi-downloadmusik": "downloadmusik", "getmusik": "getmusik", "dlmusik": "dlmusik", "downloadmusik": "downloadmusik"}, "description": "Download lagu dari hasil carimusik", "usage": ".getmusik <nomor>", "example": ".getmusik 1", "cooldown": 15, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/getmusik.js", metadata, m, extra)
handler.help = ["umi-search-getmusik <nomor>"]
handler.command = ["umi-search-getmusik", "umi-getmusik", "umi-dlmusik", "umi-downloadmusik", "getmusik", "dlmusik", "downloadmusik"]
handler.tags = ["search"]
handler.description = "Download lagu dari hasil carimusik"
handler.importSource = "umi"
handler.importConfig = {"name": "getmusik", "alias": ["dlmusik", "downloadmusik"], "category": "search", "description": "Download lagu dari hasil carimusik", "usage": ".getmusik <nomor>", "example": ".getmusik 1", "cooldown": 15, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-getmusik": "getmusik", "umi-getmusik": "getmusik", "umi-dlmusik": "dlmusik", "umi-downloadmusik": "downloadmusik", "getmusik": "getmusik", "dlmusik": "dlmusik", "downloadmusik": "downloadmusik"}
export default handler
