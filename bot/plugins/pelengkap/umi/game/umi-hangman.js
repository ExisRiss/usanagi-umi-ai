/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hangman", "category": "game", "aliasMap": {"umi-game-hangman": "hangman", "umi-hangman": "hangman", "umi-tebakkata2": "tebakkata2", "tebakkata2": "tebakkata2"}, "description": "Tebak kata (huruf per huruf)", "usage": ".hangman", "example": ".hangman", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/hangman.js", metadata, m, extra)
handler.help = ["umi-game-hangman"]
handler.command = ["umi-game-hangman", "umi-hangman", "umi-tebakkata2", "tebakkata2"]
handler.tags = ["game"]
handler.description = "Tebak kata (huruf per huruf)"
handler.importSource = "umi"
handler.importConfig = {"name": "hangman", "alias": ["tebakkata2", "hangman"], "category": "game", "description": "Tebak kata (huruf per huruf)", "usage": ".hangman", "example": ".hangman", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-hangman": "hangman", "umi-hangman": "hangman", "umi-tebakkata2": "tebakkata2", "tebakkata2": "tebakkata2"}
export default handler
