/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "flappy", "category": "game", "aliasMap": {"umi-game-flappy": "flappy", "umi-flappy": "flappy", "umi-flappybird": "flappybird"}, "description": "Game webview Flappy Bird interaktif", "usage": ".flappy", "example": ".flappy", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/flappy.js", metadata, m, extra)
handler.help = ["umi-game-flappy"]
handler.command = ["umi-game-flappy", "umi-flappy", "umi-flappybird"]
handler.tags = ["game"]
handler.description = "Game webview Flappy Bird interaktif"
handler.importSource = "umi"
handler.importConfig = {"name": "flappy", "alias": ["flappybird"], "category": "game", "description": "Game webview Flappy Bird interaktif", "usage": ".flappy", "example": ".flappy", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-flappy": "flappy", "umi-flappy": "flappy", "umi-flappybird": "flappybird"}
export default handler
