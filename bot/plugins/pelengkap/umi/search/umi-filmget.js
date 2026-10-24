/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "filmget", "category": "search", "aliasMap": {"umi-search-filmget": "filmget", "umi-filmget": "filmget", "umi-getfilm": "getfilm", "umi-filmdetail": "filmdetail", "umi-filminfo": "filminfo", "filmget": "filmget", "getfilm": "getfilm", "filmdetail": "filmdetail", "filminfo": "filminfo"}, "description": "Ambil detail film", "usage": ".filmget <url>", "example": ".filmget https://tv.neoxr.eu/film/civil-war-2024", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/filmget.js", metadata, m, extra)
handler.help = ["umi-search-filmget <url>"]
handler.command = ["umi-search-filmget", "umi-filmget", "umi-getfilm", "umi-filmdetail", "umi-filminfo", "filmget", "getfilm", "filmdetail", "filminfo"]
handler.tags = ["search"]
handler.description = "Ambil detail film"
handler.importSource = "umi"
handler.importConfig = {"name": "filmget", "alias": ["getfilm", "filmdetail", "filminfo"], "category": "search", "description": "Ambil detail film", "usage": ".filmget <url>", "example": ".filmget https://tv.neoxr.eu/film/civil-war-2024", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-filmget": "filmget", "umi-filmget": "filmget", "umi-getfilm": "getfilm", "umi-filmdetail": "filmdetail", "umi-filminfo": "filminfo", "filmget": "filmget", "getfilm": "getfilm", "filmdetail": "filmdetail", "filminfo": "filminfo"}
export default handler
