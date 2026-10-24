/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "searchcode", "category": "search", "aliasMap": {"umi-search-searchcode": "searchcode", "umi-searchcode": "searchcode", "searchcode": "searchcode"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/searchcode.js", metadata, m, extra)
handler.help = ["umi-search-searchcode"]
handler.command = ["umi-search-searchcode", "umi-searchcode", "searchcode"]
handler.tags = ["search"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "searchcode", "alias": [], "category": "search", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-searchcode": "searchcode", "umi-searchcode": "searchcode", "searchcode": "searchcode"}
export default handler
