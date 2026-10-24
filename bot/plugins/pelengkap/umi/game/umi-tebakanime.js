import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tebakanime", "category": "game", "aliasMap": {"umi-game-tebakanime": "tebakanime", "umi-tebakanime": "tebakanime", "umi-tebaknime": "tebaknime", "umi-guessanime": "guessanime", "tebakanime": "tebakanime", "tebaknime": "tebaknime", "guessanime": "guessanime"}, "description": "Tebak anime dari deskripsi (dapat limit)", "usage": ".tebakanime", "example": ".tebakanime", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/tebakanime.js", metadata, m, extra)
handler.help = ["umi-game-tebakanime"]
handler.command = ["umi-game-tebakanime", "umi-tebakanime", "umi-tebaknime", "umi-guessanime", "tebakanime", "tebaknime", "guessanime"]
handler.tags = ["game"]
handler.description = "Tebak anime dari deskripsi (dapat limit)"
handler.importSource = "umi"
handler.importConfig = {"name": "tebakanime", "alias": ["tebaknime", "guessanime"], "category": "game", "description": "Tebak anime dari deskripsi (dapat limit)", "usage": ".tebakanime", "example": ".tebakanime", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-tebakanime": "tebakanime", "umi-tebakanime": "tebakanime", "umi-tebaknime": "tebaknime", "umi-guessanime": "guessanime", "tebakanime": "tebakanime", "tebaknime": "tebaknime", "guessanime": "guessanime"}
export default handler
