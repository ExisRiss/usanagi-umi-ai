/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "alchemy", "category": "rpg", "aliasMap": {"umi-rpg-alchemy": "alchemy", "umi-alchemy": "alchemy", "umi-potion": "potion", "umi-brew": "brew", "umi-ramuan": "ramuan"}, "description": "Buat potion dan ramuan dari herba", "usage": ".alchemy <potion>", "example": ".alchemy healthpotion", "cooldown": 60, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/alchemy.js", metadata, m, extra)
handler.help = ["umi-rpg-alchemy <potion>"]
handler.command = ["umi-rpg-alchemy", "umi-alchemy", "umi-potion", "umi-brew", "umi-ramuan"]
handler.tags = ["rpg"]
handler.description = "Buat potion dan ramuan dari herba"
handler.importSource = "umi"
handler.importConfig = {"name": "alchemy", "alias": ["potion", "brew", "ramuan"], "category": "rpg", "description": "Buat potion dan ramuan dari herba", "usage": ".alchemy <potion>", "example": ".alchemy healthpotion", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-alchemy": "alchemy", "umi-alchemy": "alchemy", "umi-potion": "potion", "umi-brew": "brew", "umi-ramuan": "ramuan"}
export default handler
