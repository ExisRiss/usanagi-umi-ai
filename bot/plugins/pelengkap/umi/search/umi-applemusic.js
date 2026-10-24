/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "applemusic", "category": "search", "aliasMap": {"umi-search-applemusic": "applemusic", "umi-amusic": "amusic", "amusic": "amusic"}, "description": "Cari lagu di Apple Music", "usage": ".applemusic <query>", "example": ".applemusic Best Friend", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/applemusic.js", metadata, m, extra)
handler.help = ["umi-search-applemusic <query>"]
handler.command = ["umi-search-applemusic", "umi-amusic", "amusic"]
handler.tags = ["search"]
handler.description = "Cari lagu di Apple Music"
handler.importSource = "umi"
handler.importConfig = {"name": "applemusic", "alias": ["amusic", "am"], "category": "search", "description": "Cari lagu di Apple Music", "usage": ".applemusic <query>", "example": ".applemusic Best Friend", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-applemusic": "applemusic", "umi-amusic": "amusic", "amusic": "amusic"}
export default handler
