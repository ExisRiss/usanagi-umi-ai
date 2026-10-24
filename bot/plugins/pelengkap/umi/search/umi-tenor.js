/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tenor", "category": "search", "aliasMap": {"umi-search-tenor": "tenor", "umi-tenor": "tenor", "umi-gif": "gif", "umi-gifsearch": "gifsearch", "tenor": "tenor", "gifsearch": "gifsearch"}, "description": "Cari GIF dari Tenor", "usage": ".tenor <query>", "example": ".tenor kucing lucu", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/tenor.js", metadata, m, extra)
handler.help = ["umi-search-tenor <query>"]
handler.command = ["umi-search-tenor", "umi-tenor", "umi-gif", "umi-gifsearch", "tenor", "gifsearch"]
handler.tags = ["search"]
handler.description = "Cari GIF dari Tenor"
handler.importSource = "umi"
handler.importConfig = {"name": "tenor", "alias": ["gif", "gifsearch"], "category": "search", "description": "Cari GIF dari Tenor", "usage": ".tenor <query>", "example": ".tenor kucing lucu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-tenor": "tenor", "umi-tenor": "tenor", "umi-gif": "gif", "umi-gifsearch": "gifsearch", "tenor": "tenor", "gifsearch": "gifsearch"}
export default handler
