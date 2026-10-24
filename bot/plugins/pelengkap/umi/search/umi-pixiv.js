/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pixiv", "category": "search", "aliasMap": {"umi-search-pixiv": "pixiv", "umi-pixiv": "pixiv", "umi-pixivsearch": "pixivsearch", "umi-caripixiv": "caripixiv", "pixiv": "pixiv", "pixivsearch": "pixivsearch", "caripixiv": "caripixiv"}, "description": "Cari artwork di Pixiv", "usage": ".pixiv <query>", "example": ".pixiv rem", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/pixiv.js", metadata, m, extra)
handler.help = ["umi-search-pixiv <query>"]
handler.command = ["umi-search-pixiv", "umi-pixiv", "umi-pixivsearch", "umi-caripixiv", "pixiv", "pixivsearch", "caripixiv"]
handler.tags = ["search"]
handler.description = "Cari artwork di Pixiv"
handler.importSource = "umi"
handler.importConfig = {"name": "pixiv", "alias": ["pixivsearch", "caripixiv"], "category": "search", "description": "Cari artwork di Pixiv", "usage": ".pixiv <query>", "example": ".pixiv rem", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-pixiv": "pixiv", "umi-pixiv": "pixiv", "umi-pixivsearch": "pixivsearch", "umi-caripixiv": "caripixiv", "pixiv": "pixiv", "pixivsearch": "pixivsearch", "caripixiv": "caripixiv"}
export default handler
