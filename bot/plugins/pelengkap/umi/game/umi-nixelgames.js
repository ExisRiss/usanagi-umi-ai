/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nixelgames", "category": "game", "aliasMap": {"umi-game-nixelgames": "nixelgames", "umi-nixelgames": "nixelgames", "umi-nixel": "nixel", "umi-nixelgame": "nixelgame", "umi-minigames": "minigames", "nixelgames": "nixelgames", "nixel": "nixel", "nixelgame": "nixelgame", "minigames": "minigames"}, "description": "Kumpulan mini game AI Rich: Dino Runner, Tic Tac Toe, dan Doom", "usage": ".nixelgames", "example": ".nixelgames", "cooldown": 2, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/nixelgames.js", metadata, m, extra)
handler.help = ["umi-game-nixelgames"]
handler.command = ["umi-game-nixelgames", "umi-nixelgames", "umi-nixel", "umi-nixelgame", "umi-minigames", "nixelgames", "nixel", "nixelgame", "minigames"]
handler.tags = ["game"]
handler.description = "Kumpulan mini game AI Rich: Dino Runner, Tic Tac Toe, dan Doom"
handler.importSource = "umi"
handler.importConfig = {"name": "nixelgames", "alias": ["nixel", "nixelgame", "minigames"], "category": "game", "description": "Kumpulan mini game AI Rich: Dino Runner, Tic Tac Toe, dan Doom", "usage": ".nixelgames", "example": ".nixelgames", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 2, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-nixelgames": "nixelgames", "umi-nixelgames": "nixelgames", "umi-nixel": "nixel", "umi-nixelgame": "nixelgame", "umi-minigames": "minigames", "nixelgames": "nixelgames", "nixel": "nixel", "nixelgame": "nixelgame", "minigames": "minigames"}
export default handler
