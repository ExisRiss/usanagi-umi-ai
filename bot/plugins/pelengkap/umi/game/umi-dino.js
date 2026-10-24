import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dino", "category": "game", "aliasMap": {"umi-game-dino": "dino", "umi-dino": "dino", "umi-dinorun": "dinorun"}, "description": "Game Dino Run inline HTML dengan endless runner, skor, combo, koin dan perisai", "usage": ".dino", "example": ".dino", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/dino.js", metadata, m, extra)
handler.help = ["umi-game-dino"]
handler.command = ["umi-game-dino", "umi-dino", "umi-dinorun"]
handler.tags = ["game"]
handler.description = "Game Dino Run inline HTML dengan endless runner, skor, combo, koin dan perisai"
handler.importSource = "umi"
handler.importConfig = {"name": "dino", "alias": ["dinorun"], "category": "game", "description": "Game Dino Run inline HTML dengan endless runner, skor, combo, koin dan perisai", "usage": ".dino", "example": ".dino", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-dino": "dino", "umi-dino": "dino", "umi-dinorun": "dinorun"}
export default handler
