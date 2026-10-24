import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wwsorcerer", "category": "game", "aliasMap": {"umi-game-wwsorcerer": "wwsorcerer", "umi-wwsorcerer": "wwsorcerer", "umi-sorcerer": "sorcerer", "umi-wws": "wws", "wwsorcerer": "wwsorcerer", "sorcerer": "sorcerer", "wws": "wws"}, "description": "Sorcerer night action - Check if target is Seer", "usage": ".wwsorcerer <nomor>", "example": ".wwsorcerer 3", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/wwsorcerer.js", metadata, m, extra)
handler.help = ["umi-game-wwsorcerer <nomor>"]
handler.command = ["umi-game-wwsorcerer", "umi-wwsorcerer", "umi-sorcerer", "umi-wws", "wwsorcerer", "sorcerer", "wws"]
handler.tags = ["game"]
handler.description = "Sorcerer night action - Check if target is Seer"
handler.importSource = "umi"
handler.importConfig = {"name": "wwsorcerer", "alias": ["sorcerer", "wws"], "category": "game", "description": "Sorcerer night action - Check if target is Seer", "usage": ".wwsorcerer <nomor>", "example": ".wwsorcerer 3", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": true, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = true
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-wwsorcerer": "wwsorcerer", "umi-wwsorcerer": "wwsorcerer", "umi-sorcerer": "sorcerer", "umi-wws": "wws", "wwsorcerer": "wwsorcerer", "sorcerer": "sorcerer", "wws": "wws"}
export default handler
