/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "checkers", "category": "game", "aliasMap": {"umi-game-checkers": "checkers", "umi-checkers": "checkers", "umi-dam": "dam", "umi-caturdam": "caturdam", "umi-zerocheckers": "zerocheckers", "checkers": "checkers", "dam": "dam", "caturdam": "caturdam", "zerocheckers": "zerocheckers"}, "description": "Game catur dam / checkers Umi! Makan semua pion lawan untuk menang.", "usage": ".checkers [@lawan]", "example": ".checkers @user", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/checkerszerotwo.js", metadata, m, extra)
handler.help = ["umi-game-checkers [@lawan]"]
handler.command = ["umi-game-checkers", "umi-checkers", "umi-dam", "umi-caturdam", "umi-zerocheckers", "checkers", "dam", "caturdam", "zerocheckers"]
handler.tags = ["game"]
handler.description = "Game catur dam / checkers Umi! Makan semua pion lawan untuk menang."
handler.importSource = "umi"
handler.importConfig = {"name": "checkers", "alias": ["dam", "caturdam", "zerocheckers"], "category": "game", "description": "Game catur dam / checkers Umi! Makan semua pion lawan untuk menang.", "usage": ".checkers [@lawan]", "example": ".checkers @user", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-checkers": "checkers", "umi-checkers": "checkers", "umi-dam": "dam", "umi-caturdam": "caturdam", "umi-zerocheckers": "zerocheckers", "checkers": "checkers", "dam": "dam", "caturdam": "caturdam", "zerocheckers": "zerocheckers"}
export default handler
