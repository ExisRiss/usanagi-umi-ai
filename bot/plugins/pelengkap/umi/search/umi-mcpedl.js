/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mcpedl", "category": "search", "aliasMap": {"umi-search-mcpedl": "mcpedl", "umi-mcpedl": "mcpedl", "umi-mcpe": "mcpe", "umi-mcpesearch": "mcpesearch", "umi-searchmcpe": "searchmcpe", "mcpedl": "mcpedl", "mcpe": "mcpe", "mcpesearch": "mcpesearch", "searchmcpe": "searchmcpe"}, "description": "Cari map dan addon Minecraft PE dari MCPEDL", "usage": ".mcpe <query>", "example": ".mcpe survival", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/mcpedl.js", metadata, m, extra)
handler.help = ["umi-search-mcpedl <query>"]
handler.command = ["umi-search-mcpedl", "umi-mcpedl", "umi-mcpe", "umi-mcpesearch", "umi-searchmcpe", "mcpedl", "mcpe", "mcpesearch", "searchmcpe"]
handler.tags = ["search"]
handler.description = "Cari map dan addon Minecraft PE dari MCPEDL"
handler.importSource = "umi"
handler.importConfig = {"name": "mcpedl", "alias": ["mcpe", "mcpesearch", "searchmcpe"], "category": "search", "description": "Cari map dan addon Minecraft PE dari MCPEDL", "usage": ".mcpe <query>", "example": ".mcpe survival", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-mcpedl": "mcpedl", "umi-mcpedl": "mcpedl", "umi-mcpe": "mcpe", "umi-mcpesearch": "mcpesearch", "umi-searchmcpe": "searchmcpe", "mcpedl": "mcpedl", "mcpe": "mcpe", "mcpesearch": "mcpesearch", "searchmcpe": "searchmcpe"}
export default handler
