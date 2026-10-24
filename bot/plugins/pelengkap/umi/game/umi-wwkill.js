/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wwkill", "category": "game", "aliasMap": {"umi-game-wwkill": "wwkill", "umi-wwkill": "wwkill", "umi-wolfkill": "wolfkill", "umi-wk": "wk", "wwkill": "wwkill", "wolfkill": "wolfkill", "wk": "wk"}, "description": "Werewolf night action - Kill target", "usage": ".wwkill <nomor>", "example": ".wwkill 2", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/wwkill.js", metadata, m, extra)
handler.help = ["umi-game-wwkill <nomor>"]
handler.command = ["umi-game-wwkill", "umi-wwkill", "umi-wolfkill", "umi-wk", "wwkill", "wolfkill", "wk"]
handler.tags = ["game"]
handler.description = "Werewolf night action - Kill target"
handler.importSource = "umi"
handler.importConfig = {"name": "wwkill", "alias": ["wolfkill", "wk"], "category": "game", "description": "Werewolf night action - Kill target", "usage": ".wwkill <nomor>", "example": ".wwkill 2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-wwkill": "wwkill", "umi-wwkill": "wwkill", "umi-wolfkill": "wolfkill", "umi-wk": "wk", "wwkill": "wwkill", "wolfkill": "wolfkill", "wk": "wk"}
export default handler
