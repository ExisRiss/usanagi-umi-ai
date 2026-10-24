import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fisht", "category": "game", "aliasMap": {"umi-game-fisht": "fisht", "umi-fisht": "fisht", "umi-fishit": "fishit", "fisht": "fisht", "fishit": "fishit"}, "description": "Fishit - Fishing Rod Game", "usage": ".fisht <command>", "example": ".fisht help", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/fisch.js", metadata, m, extra)
handler.help = ["umi-game-fisht <command>"]
handler.command = ["umi-game-fisht", "umi-fisht", "umi-fishit", "fisht", "fishit"]
handler.tags = ["game"]
handler.description = "Fishit - Fishing Rod Game"
handler.importSource = "umi"
handler.importConfig = {"name": "fisht", "alias": ["fishit"], "category": "game", "description": "Fishit - Fishing Rod Game", "usage": ".fisht <command>", "example": ".fisht help", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-fisht": "fisht", "umi-fisht": "fisht", "umi-fishit": "fishit", "fisht": "fisht", "fishit": "fishit"}
export default handler
