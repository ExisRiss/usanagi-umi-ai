import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "snake", "category": "game", "aliasMap": {"umi-game-snake": "snake", "umi-snake": "snake", "umi-ular": "ular", "umi-ularrimba": "ularrimba", "umi-snakegame": "snakegame"}, "description": "Game Snake inline HTML dengan kontrol sentuh dan keyboard", "usage": ".snake", "example": ".snake", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/snake.js", metadata, m, extra)
handler.help = ["umi-game-snake"]
handler.command = ["umi-game-snake", "umi-snake", "umi-ular", "umi-ularrimba", "umi-snakegame"]
handler.tags = ["game"]
handler.description = "Game Snake inline HTML dengan kontrol sentuh dan keyboard"
handler.importSource = "umi"
handler.importConfig = {"name": "snake", "alias": ["ular", "ularrimba", "snakegame"], "category": "game", "description": "Game Snake inline HTML dengan kontrol sentuh dan keyboard", "usage": ".snake", "example": ".snake", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-snake": "snake", "umi-snake": "snake", "umi-ular": "ular", "umi-ularrimba": "ularrimba", "umi-snakegame": "snakegame"}
export default handler
