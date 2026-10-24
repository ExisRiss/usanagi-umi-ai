/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "werewolf", "category": "game", "aliasMap": {"umi-game-werewolf": "werewolf", "umi-werewolf": "werewolf", "umi-ww": "ww", "umi-wwgc": "wwgc", "werewolf": "werewolf", "ww": "ww", "wwgc": "wwgc"}, "description": "Main Werewolf Game bersama player lain", "usage": ".ww <create|join|start|vote|player|exit|delete>", "example": ".ww create", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/werewolf.js", metadata, m, extra)
handler.help = ["umi-game-werewolf <create|join|start|vote|player|exit|delete>"]
handler.command = ["umi-game-werewolf", "umi-werewolf", "umi-ww", "umi-wwgc", "werewolf", "ww", "wwgc"]
handler.tags = ["game"]
handler.description = "Main Werewolf Game bersama player lain"
handler.importSource = "umi"
handler.importConfig = {"name": "werewolf", "alias": ["ww", "wwgc"], "category": "game", "description": "Main Werewolf Game bersama player lain", "usage": ".ww <create|join|start|vote|player|exit|delete>", "example": ".ww create", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-werewolf": "werewolf", "umi-werewolf": "werewolf", "umi-ww": "ww", "umi-wwgc": "wwgc", "werewolf": "werewolf", "ww": "ww", "wwgc": "wwgc"}
export default handler
