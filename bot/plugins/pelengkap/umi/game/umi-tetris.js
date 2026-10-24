import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tetris", "category": "game", "aliasMap": {"umi-game-tetris": "tetris", "umi-tetris": "tetris", "umi-tetri": "tetri"}, "description": "Game Tetris inline HTML", "usage": ".tetris", "example": ".tetris", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/tetris.js", metadata, m, extra)
handler.help = ["umi-game-tetris"]
handler.command = ["umi-game-tetris", "umi-tetris", "umi-tetri"]
handler.tags = ["game"]
handler.description = "Game Tetris inline HTML"
handler.importSource = "umi"
handler.importConfig = {"name": "tetris", "alias": ["tetri"], "category": "game", "description": "Game Tetris inline HTML", "usage": ".tetris", "example": ".tetris", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-tetris": "tetris", "umi-tetris": "tetris", "umi-tetri": "tetri"}
export default handler
