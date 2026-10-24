/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "breakout", "category": "game", "aliasMap": {"umi-game-breakout": "breakout", "umi-breakout": "breakout", "umi-arrowbreakout": "arrowbreakout", "breakout": "breakout", "arrowbreakout": "arrowbreakout"}, "description": "Game webview Arrow Breakout interaktif", "usage": ".breakout", "example": ".breakout", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/breakout.js", metadata, m, extra)
handler.help = ["umi-game-breakout"]
handler.command = ["umi-game-breakout", "umi-breakout", "umi-arrowbreakout", "breakout", "arrowbreakout"]
handler.tags = ["game"]
handler.description = "Game webview Arrow Breakout interaktif"
handler.importSource = "umi"
handler.importConfig = {"name": "breakout", "alias": ["arrowbreakout"], "category": "game", "description": "Game webview Arrow Breakout interaktif", "usage": ".breakout", "example": ".breakout", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-breakout": "breakout", "umi-breakout": "breakout", "umi-arrowbreakout": "arrowbreakout", "breakout": "breakout", "arrowbreakout": "arrowbreakout"}
export default handler
