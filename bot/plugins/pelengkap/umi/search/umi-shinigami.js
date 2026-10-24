/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "shinigami", "category": "search", "aliasMap": {"umi-search-shinigami": "shinigami", "umi-shini": "shini", "umi-shinigamisearch": "shinigamisearch", "shini": "shini", "shinigamisearch": "shinigamisearch"}, "description": "Mencari manga/manhwa di Shinigami", "usage": ".shinigami <judul/genre>", "example": ".shinigami solo leveling", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/shinigami.js", metadata, m, extra)
handler.help = ["umi-search-shinigami <judul/genre>"]
handler.command = ["umi-search-shinigami", "umi-shini", "umi-shinigamisearch", "shini", "shinigamisearch"]
handler.tags = ["search"]
handler.description = "Mencari manga/manhwa di Shinigami"
handler.importSource = "umi"
handler.importConfig = {"name": "shinigami", "alias": ["shini", "shinigamisearch"], "category": "search", "description": "Mencari manga/manhwa di Shinigami", "usage": ".shinigami <judul/genre>", "example": ".shinigami solo leveling", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-shinigami": "shinigami", "umi-shini": "shini", "umi-shinigamisearch": "shinigamisearch", "shini": "shini", "shinigamisearch": "shinigamisearch"}
export default handler
