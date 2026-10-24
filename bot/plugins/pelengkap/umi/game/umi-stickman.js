import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stickman", "category": "game", "aliasMap": {"umi-game-stickman": "stickman", "umi-stickman": "stickman", "umi-stick": "stick", "umi-stickgame": "stickgame", "stickman": "stickman", "stick": "stick", "stickgame": "stickgame"}, "description": "Game Stickman HTML AI Rich.", "usage": ".stickman", "example": ".stickman", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/stickman.js", metadata, m, extra)
handler.help = ["umi-game-stickman"]
handler.command = ["umi-game-stickman", "umi-stickman", "umi-stick", "umi-stickgame", "stickman", "stick", "stickgame"]
handler.tags = ["game"]
handler.description = "Game Stickman HTML AI Rich."
handler.importSource = "umi"
handler.importConfig = {"name": "stickman", "alias": ["stick", "stickgame"], "category": "game", "description": "Game Stickman HTML AI Rich.", "usage": ".stickman", "example": ".stickman", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-stickman": "stickman", "umi-stickman": "stickman", "umi-stick": "stick", "umi-stickgame": "stickgame", "stickman": "stickman", "stick": "stick", "stickgame": "stickgame"}
export default handler
