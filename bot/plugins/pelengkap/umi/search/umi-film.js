/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "film", "category": "search", "aliasMap": {"umi-search-film": "film", "umi-nonton": "nonton", "umi-lk21": "lk21", "film": "film", "movie": "movie", "nonton": "nonton", "lk21": "lk21"}, "description": "Cari film dan nonton online", "usage": ".film <judul>", "example": ".film civil war", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/film.js", metadata, m, extra)
handler.help = ["umi-search-film <judul>"]
handler.command = ["umi-search-film", "umi-nonton", "umi-lk21", "film", "movie", "nonton", "lk21"]
handler.tags = ["search"]
handler.description = "Cari film dan nonton online"
handler.importSource = "umi"
handler.importConfig = {"name": "film", "alias": ["movie", "nonton", "lk21"], "category": "search", "description": "Cari film dan nonton online", "usage": ".film <judul>", "example": ".film civil war", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-film": "film", "umi-nonton": "nonton", "umi-lk21": "lk21", "film": "film", "movie": "movie", "nonton": "nonton", "lk21": "lk21"}
export default handler
