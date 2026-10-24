/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lirik", "category": "search", "aliasMap": {"umi-search-lirik": "lirik", "umi-lirik": "lirik", "umi-lyric": "lyric", "umi-lyrics": "lyrics", "umi-liriklagu": "liriklagu", "lyric": "lyric", "liriklagu": "liriklagu"}, "description": "Cari lirik lagu", "usage": ".lirik <query>", "example": ".lirik sempurna", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/lyrics.js", metadata, m, extra)
handler.help = ["umi-search-lirik <query>"]
handler.command = ["umi-search-lirik", "umi-lirik", "umi-lyric", "umi-lyrics", "umi-liriklagu", "lyric", "liriklagu"]
handler.tags = ["search"]
handler.description = "Cari lirik lagu"
handler.importSource = "umi"
handler.importConfig = {"name": "lirik", "alias": ["lyric", "lyrics", "liriklagu"], "category": "search", "description": "Cari lirik lagu", "usage": ".lirik <query>", "example": ".lirik sempurna", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-lirik": "lirik", "umi-lirik": "lirik", "umi-lyric": "lyric", "umi-lyrics": "lyrics", "umi-liriklagu": "liriklagu", "lyric": "lyric", "liriklagu": "liriklagu"}
export default handler
