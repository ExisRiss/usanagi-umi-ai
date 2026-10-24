/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tokusatsu", "category": "anime", "aliasMap": {"umi-anime-tokusatsu": "tokusatsu", "umi-tokusatsu": "tokusatsu", "umi-toku": "toku", "tokusatsu": "tokusatsu", "toku": "toku"}, "description": "Cari dan lihat data serial/episode tokusatsu dari TokusatsuIndo", "usage": ".tokusatsu <judul atau link>", "example": ".tokusatsu kamen rider\n.tokusatsu https://www.tokusatsuindo.com/...", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/tokusatsu.js", metadata, m, extra)
handler.help = ["umi-anime-tokusatsu <judul atau link>"]
handler.command = ["umi-anime-tokusatsu", "umi-tokusatsu", "umi-toku", "tokusatsu", "toku"]
handler.tags = ["anime"]
handler.description = "Cari dan lihat data serial/episode tokusatsu dari TokusatsuIndo"
handler.importSource = "umi"
handler.importConfig = {"name": "tokusatsu", "alias": ["toku"], "category": "anime", "description": "Cari dan lihat data serial/episode tokusatsu dari TokusatsuIndo", "usage": ".tokusatsu <judul atau link>", "example": ".tokusatsu kamen rider\n.tokusatsu https://www.tokusatsuindo.com/...", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-tokusatsu": "tokusatsu", "umi-tokusatsu": "tokusatsu", "umi-toku": "toku", "tokusatsu": "tokusatsu", "toku": "toku"}
export default handler
