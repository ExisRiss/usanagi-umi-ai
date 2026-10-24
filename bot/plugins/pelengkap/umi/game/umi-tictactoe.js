import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tictactoe", "category": "game", "aliasMap": {"umi-game-tictactoe": "tictactoe", "umi-tictactoe": "tictactoe", "umi-ttt": "ttt", "umi-xo": "xo", "xo": "xo"}, "description": "Main TicTacToe dengan player lain", "usage": ".tictactoe [room name] atau .ttt", "example": ".tictactoe", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/tictactoe.js", metadata, m, extra)
handler.help = ["umi-game-tictactoe [room name] atau .ttt"]
handler.command = ["umi-game-tictactoe", "umi-tictactoe", "umi-ttt", "umi-xo", "xo"]
handler.tags = ["game"]
handler.description = "Main TicTacToe dengan player lain"
handler.importSource = "umi"
handler.importConfig = {"name": "tictactoe", "alias": ["ttt", "xo"], "category": "game", "description": "Main TicTacToe dengan player lain", "usage": ".tictactoe [room name] atau .ttt", "example": ".tictactoe", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-tictactoe": "tictactoe", "umi-tictactoe": "tictactoe", "umi-ttt": "ttt", "umi-xo": "xo", "xo": "xo"}
export default handler
