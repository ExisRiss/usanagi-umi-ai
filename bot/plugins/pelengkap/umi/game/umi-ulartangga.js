/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ulartangga", "category": "game", "aliasMap": {"umi-game-ulartangga": "ulartangga", "umi-ulartangga": "ulartangga", "umi-ut": "ut", "umi-snakeladder": "snakeladder", "umi-sl": "sl", "ulartangga": "ulartangga", "ut": "ut", "snakeladder": "snakeladder", "sl": "sl"}, "description": "Main ular tangga bersama player lain dengan visual board", "usage": ".ulartangga <create|join|start|info|exit|delete>", "example": ".ulartangga create", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/ulartangga.js", metadata, m, extra)
handler.help = ["umi-game-ulartangga <create|join|start|info|exit|delete>"]
handler.command = ["umi-game-ulartangga", "umi-ulartangga", "umi-ut", "umi-snakeladder", "umi-sl", "ulartangga", "ut", "snakeladder", "sl"]
handler.tags = ["game"]
handler.description = "Main ular tangga bersama player lain dengan visual board"
handler.importSource = "umi"
handler.importConfig = {"name": "ulartangga", "alias": ["ut", "snakeladder", "sl"], "category": "game", "description": "Main ular tangga bersama player lain dengan visual board", "usage": ".ulartangga <create|join|start|info|exit|delete>", "example": ".ulartangga create", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-ulartangga": "ulartangga", "umi-ulartangga": "ulartangga", "umi-ut": "ut", "umi-snakeladder": "snakeladder", "umi-sl": "sl", "ulartangga": "ulartangga", "ut": "ut", "snakeladder": "snakeladder", "sl": "sl"}
export default handler
