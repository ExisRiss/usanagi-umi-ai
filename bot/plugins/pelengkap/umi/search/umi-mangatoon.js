/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mangatoon", "category": "search", "aliasMap": {"umi-search-mangatoon": "mangatoon", "umi-mangatoon": "mangatoon", "umi-mtoon": "mtoon", "umi-mangatoonsearch": "mangatoonsearch", "umi-searchmangatoon": "searchmangatoon", "mangatoon": "mangatoon", "mtoon": "mtoon", "mangatoonsearch": "mangatoonsearch", "searchmangatoon": "searchmangatoon"}, "description": "Cari komik di Mangatoon", "usage": ".mangatoon <query>", "example": ".mangatoon love", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/mangatoon.js", metadata, m, extra)
handler.help = ["umi-search-mangatoon <query>"]
handler.command = ["umi-search-mangatoon", "umi-mangatoon", "umi-mtoon", "umi-mangatoonsearch", "umi-searchmangatoon", "mangatoon", "mtoon", "mangatoonsearch", "searchmangatoon"]
handler.tags = ["search"]
handler.description = "Cari komik di Mangatoon"
handler.importSource = "umi"
handler.importConfig = {"name": "mangatoon", "alias": ["mtoon", "mangatoonsearch", "searchmangatoon"], "category": "search", "description": "Cari komik di Mangatoon", "usage": ".mangatoon <query>", "example": ".mangatoon love", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-mangatoon": "mangatoon", "umi-mangatoon": "mangatoon", "umi-mtoon": "mtoon", "umi-mangatoonsearch": "mangatoonsearch", "umi-searchmangatoon": "searchmangatoon", "mangatoon": "mangatoon", "mtoon": "mtoon", "mangatoonsearch": "mangatoonsearch", "searchmangatoon": "searchmangatoon"}
export default handler
