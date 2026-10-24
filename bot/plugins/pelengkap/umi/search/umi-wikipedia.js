/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wikipedia", "category": "search", "aliasMap": {"umi-search-wikipedia": "wikipedia", "umi-wikipedia": "wikipedia", "umi-wiki": "wiki", "umi-wp": "wp", "wp": "wp"}, "description": "Mencari artikel lengkap dari Wikipedia", "usage": ".wikipedia <query>", "example": ".wikipedia Rendang", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/wikipedia.js", metadata, m, extra)
handler.help = ["umi-search-wikipedia <query>"]
handler.command = ["umi-search-wikipedia", "umi-wikipedia", "umi-wiki", "umi-wp", "wp"]
handler.tags = ["search"]
handler.description = "Mencari artikel lengkap dari Wikipedia"
handler.importSource = "umi"
handler.importConfig = {"name": "wikipedia", "alias": ["wiki", "wp"], "category": "search", "description": "Mencari artikel lengkap dari Wikipedia", "usage": ".wikipedia <query>", "example": ".wikipedia Rendang", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-wikipedia": "wikipedia", "umi-wikipedia": "wikipedia", "umi-wiki": "wiki", "umi-wp": "wp", "wp": "wp"}
export default handler
