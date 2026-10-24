/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "carimusik", "category": "search", "aliasMap": {"umi-search-carimusik": "carimusik", "umi-carimusik": "carimusik", "umi-searchmusik": "searchmusik", "umi-musiksearch": "musiksearch", "carimusik": "carimusik", "searchmusik": "searchmusik", "musiksearch": "musiksearch"}, "description": "Cari lagu dan siapkan hasil untuk diunduh", "usage": ".carimusik <judul lagu>", "example": ".carimusik night dancer", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/carimusik.js", metadata, m, extra)
handler.help = ["umi-search-carimusik <judul lagu>"]
handler.command = ["umi-search-carimusik", "umi-carimusik", "umi-searchmusik", "umi-musiksearch", "carimusik", "searchmusik", "musiksearch"]
handler.tags = ["search"]
handler.description = "Cari lagu dan siapkan hasil untuk diunduh"
handler.importSource = "umi"
handler.importConfig = {"name": "carimusik", "alias": ["searchmusik", "musiksearch", "cari lagu"], "category": "search", "description": "Cari lagu dan siapkan hasil untuk diunduh", "usage": ".carimusik <judul lagu>", "example": ".carimusik night dancer", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-carimusik": "carimusik", "umi-carimusik": "carimusik", "umi-searchmusik": "searchmusik", "umi-musiksearch": "musiksearch", "carimusik": "carimusik", "searchmusik": "searchmusik", "musiksearch": "musiksearch"}
export default handler
