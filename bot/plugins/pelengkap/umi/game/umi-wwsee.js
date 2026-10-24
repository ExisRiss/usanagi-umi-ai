import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wwsee", "category": "game", "aliasMap": {"umi-game-wwsee": "wwsee", "umi-wwsee": "wwsee", "umi-seer": "seer", "umi-vision": "vision", "umi-wse": "wse", "wwsee": "wwsee", "seer": "seer", "vision": "vision", "wse": "wse"}, "description": "Seer night action - See target role", "usage": ".wwsee <nomor>", "example": ".wwsee 1", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/wwsee.js", metadata, m, extra)
handler.help = ["umi-game-wwsee <nomor>"]
handler.command = ["umi-game-wwsee", "umi-wwsee", "umi-seer", "umi-vision", "umi-wse", "wwsee", "seer", "vision", "wse"]
handler.tags = ["game"]
handler.description = "Seer night action - See target role"
handler.importSource = "umi"
handler.importConfig = {"name": "wwsee", "alias": ["seer", "vision", "wse"], "category": "game", "description": "Seer night action - See target role", "usage": ".wwsee <nomor>", "example": ".wwsee 1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-wwsee": "wwsee", "umi-wwsee": "wwsee", "umi-seer": "seer", "umi-vision": "vision", "umi-wse": "wse", "wwsee": "wwsee", "seer": "seer", "vision": "vision", "wse": "wse"}
export default handler
