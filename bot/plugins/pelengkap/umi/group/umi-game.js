/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "game", "category": "group", "aliasMap": {"umi-group-game": "game", "umi-game": "game", "umi-togglegame": "togglegame", "game": "game", "togglegame": "togglegame"}, "description": "Mengaktifkan atau menonaktifkan fitur game di grup", "usage": ".game <on/off>", "example": ".game on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/game.js", metadata, m, extra)
handler.help = ["umi-group-game <on/off>"]
handler.command = ["umi-group-game", "umi-game", "umi-togglegame", "game", "togglegame"]
handler.tags = ["group"]
handler.description = "Mengaktifkan atau menonaktifkan fitur game di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "game", "alias": ["togglegame"], "category": "group", "description": "Mengaktifkan atau menonaktifkan fitur game di grup", "usage": ".game <on/off>", "example": ".game on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-game": "game", "umi-game": "game", "umi-togglegame": "togglegame", "game": "game", "togglegame": "togglegame"}
export default handler
