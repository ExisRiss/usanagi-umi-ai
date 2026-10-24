/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tebakgame", "category": "game", "aliasMap": {"umi-game-tebakgame": "tebakgame", "umi-tebakgame": "tebakgame"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/tebakgame.js", metadata, m, extra)
handler.help = ["umi-game-tebakgame"]
handler.command = ["umi-game-tebakgame", "umi-tebakgame"]
handler.tags = ["game"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "tebakgame", "alias": [], "category": "game", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-tebakgame": "tebakgame", "umi-tebakgame": "tebakgame"}
export default handler
