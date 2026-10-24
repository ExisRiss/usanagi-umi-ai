/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mahjong", "category": "game", "aliasMap": {"umi-game-mahjong": "mahjong", "umi-mahjong": "mahjong", "umi-mjong": "mjong", "umi-kyoko": "kyoko", "mahjong": "mahjong", "mjong": "mjong", "mj": "mj", "kyoko": "kyoko"}, "description": "Kyoko Mahjong v6.2 dengan HTML AI Rich Message.", "usage": ".mahjong", "example": ".mahjong", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/mahjong-shinobu.js", metadata, m, extra)
handler.help = ["umi-game-mahjong"]
handler.command = ["umi-game-mahjong", "umi-mahjong", "umi-mjong", "umi-kyoko", "mahjong", "mjong", "mj", "kyoko"]
handler.tags = ["game"]
handler.description = "Kyoko Mahjong v6.2 dengan HTML AI Rich Message."
handler.importSource = "umi"
handler.importConfig = {"name": "mahjong", "alias": ["mjong", "mj", "kyoko"], "category": "game", "description": "Kyoko Mahjong v6.2 dengan HTML AI Rich Message.", "usage": ".mahjong", "example": ".mahjong", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-mahjong": "mahjong", "umi-mahjong": "mahjong", "umi-mjong": "mjong", "umi-kyoko": "kyoko", "mahjong": "mahjong", "mjong": "mjong", "mj": "mj", "kyoko": "kyoko"}
export default handler
