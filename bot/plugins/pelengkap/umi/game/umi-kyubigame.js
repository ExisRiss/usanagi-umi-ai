/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kyubigame", "category": "game", "aliasMap": {"umi-game-kyubigame": "kyubigame", "umi-kyubigame": "kyubigame", "umi-kyubi": "kyubi", "umi-naruto": "naruto", "umi-shinobi": "shinobi", "kyubigame": "kyubigame", "kyubi": "kyubi", "naruto": "naruto", "shinobi": "shinobi"}, "description": "Jelajahi dunia shinobi dan hadapi musuh Ninja terkuat", "usage": ".kyubigame", "example": ".kyubigame", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/kyubigame.js", metadata, m, extra)
handler.help = ["umi-game-kyubigame"]
handler.command = ["umi-game-kyubigame", "umi-kyubigame", "umi-kyubi", "umi-naruto", "umi-shinobi", "kyubigame", "kyubi", "naruto", "shinobi"]
handler.tags = ["game"]
handler.description = "Jelajahi dunia shinobi dan hadapi musuh Ninja terkuat"
handler.importSource = "umi"
handler.importConfig = {"name": "kyubigame", "alias": ["kyubi", "naruto", "shinobi"], "category": "game", "description": "Jelajahi dunia shinobi dan hadapi musuh Ninja terkuat", "usage": ".kyubigame", "example": ".kyubigame", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-kyubigame": "kyubigame", "umi-kyubigame": "kyubigame", "umi-kyubi": "kyubi", "umi-naruto": "naruto", "umi-shinobi": "shinobi", "kyubigame": "kyubigame", "kyubi": "kyubi", "naruto": "naruto", "shinobi": "shinobi"}
export default handler
