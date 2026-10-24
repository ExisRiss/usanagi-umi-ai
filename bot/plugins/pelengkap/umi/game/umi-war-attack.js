import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "attack", "category": "game", "aliasMap": {"umi-game-attack": "attack", "umi-attack": "attack", "umi-atk": "atk", "attack": "attack", "atk": "atk"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/war-attack.js", metadata, m, extra)
handler.help = ["umi-game-attack"]
handler.command = ["umi-game-attack", "umi-attack", "umi-atk", "attack", "atk"]
handler.tags = ["game"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "attack", "alias": ["atk"], "category": "game", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-attack": "attack", "umi-attack": "attack", "umi-atk": "atk", "attack": "attack", "atk": "atk"}
export default handler
