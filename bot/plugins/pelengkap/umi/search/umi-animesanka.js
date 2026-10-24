/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animesanka", "category": "search", "aliasMap": {"umi-search-animesanka": "animesanka", "umi-animesanka": "animesanka", "umi-sanka": "sanka", "umi-animeid": "animeid", "umi-animeindo": "animeindo", "animesanka": "animesanka", "sanka": "sanka", "animeid": "animeid", "animeindo": "animeindo"}, "description": "Cari info anime, streaming, download dari SankaVollerei", "usage": ".animesanka <subcommand>", "example": ".animesanka search naruto", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/animesanka.js", metadata, m, extra)
handler.help = ["umi-search-animesanka <subcommand>"]
handler.command = ["umi-search-animesanka", "umi-animesanka", "umi-sanka", "umi-animeid", "umi-animeindo", "animesanka", "sanka", "animeid", "animeindo"]
handler.tags = ["search"]
handler.description = "Cari info anime, streaming, download dari SankaVollerei"
handler.importSource = "umi"
handler.importConfig = {"name": "animesanka", "alias": ["sanka", "animeid", "animeindo"], "category": "search", "description": "Cari info anime, streaming, download dari SankaVollerei", "usage": ".animesanka <subcommand>", "example": ".animesanka search naruto", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-animesanka": "animesanka", "umi-animesanka": "animesanka", "umi-sanka": "sanka", "umi-animeid": "animeid", "umi-animeindo": "animeindo", "animesanka": "animesanka", "sanka": "sanka", "animeid": "animeid", "animeindo": "animeindo"}
export default handler
