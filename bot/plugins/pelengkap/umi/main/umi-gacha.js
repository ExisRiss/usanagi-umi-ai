/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gacha", "category": "rpg", "aliasMap": {"umi-rpg-gacha": "gacha", "umi-pull": "pull", "pull": "pull"}, "description": "Gacha untuk dapat hadiah random", "usage": ".gacha", "example": ".gacha", "cooldown": 300, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/gacha.js", metadata, m, extra)
handler.help = ["umi-rpg-gacha"]
handler.command = ["umi-rpg-gacha", "umi-pull", "pull"]
handler.tags = ["rpg"]
handler.description = "Gacha untuk dapat hadiah random"
handler.importSource = "umi"
handler.importConfig = {"name": "gacha", "alias": ["spin", "pull", "lucky"], "category": "rpg", "description": "Gacha untuk dapat hadiah random", "usage": ".gacha", "example": ".gacha", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 300, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-gacha": "gacha", "umi-pull": "pull", "pull": "pull"}
export default handler
