import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "survival", "category": "game", "aliasMap": {"umi-game-survival": "survival", "umi-survival": "survival", "umi-sv2": "sv2", "survival": "survival", "sv2": "sv2"}, "description": "Game survival lengkap dari Tensura.", "usage": ".survival <start|...>", "example": ".survival <start|...>", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/survival.js", metadata, m, extra)
handler.help = ["umi-game-survival <start|...>"]
handler.command = ["umi-game-survival", "umi-survival", "umi-sv2", "survival", "sv2"]
handler.tags = ["game"]
handler.description = "Game survival lengkap dari Tensura."
handler.importSource = "umi"
handler.importConfig = {"name": "survival", "alias": ["sv2"], "category": "game", "description": "Game survival lengkap dari Tensura.", "usage": ".survival <start|...>", "example": ".survival <start|...>", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-survival": "survival", "umi-survival": "survival", "umi-sv2": "sv2", "survival": "survival", "sv2": "sv2"}
export default handler
