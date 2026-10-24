/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "yts", "category": "search", "aliasMap": {"umi-search-yts": "yts", "umi-yts": "yts", "umi-ytsearch": "ytsearch", "umi-youtubesearch": "youtubesearch", "yts": "yts", "ytsearch": "ytsearch", "youtubesearch": "youtubesearch"}, "description": "Mencari video di YouTube berdasarkan kata kunci dan menampilkan detail lengkap beserta thumbnail.", "usage": ".yts <query>", "example": ".yts lagu pop terbaru", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/yts.js", metadata, m, extra)
handler.help = ["umi-search-yts <query>"]
handler.command = ["umi-search-yts", "umi-yts", "umi-ytsearch", "umi-youtubesearch", "yts", "ytsearch", "youtubesearch"]
handler.tags = ["search"]
handler.description = "Mencari video di YouTube berdasarkan kata kunci dan menampilkan detail lengkap beserta thumbnail."
handler.importSource = "umi"
handler.importConfig = {"name": "yts", "alias": ["ytsearch", "youtubesearch"], "category": "search", "description": "Mencari video di YouTube berdasarkan kata kunci dan menampilkan detail lengkap beserta thumbnail.", "usage": ".yts <query>", "example": ".yts lagu pop terbaru", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-yts": "yts", "umi-yts": "yts", "umi-ytsearch": "ytsearch", "umi-youtubesearch": "youtubesearch", "yts": "yts", "ytsearch": "ytsearch", "youtubesearch": "youtubesearch"}
export default handler
