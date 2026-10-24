import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dungeon", "category": "game", "aliasMap": {"umi-game-dungeon": "dungeon", "umi-dungeon": "dungeon", "umi-dg": "dg", "umi-labirin": "labirin", "dg": "dg", "labirin": "labirin"}, "description": "Jelajahi dungeon dan lawan monster secara interaktif", "usage": ".dungeon", "example": ".dungeon", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/dungeon.js", metadata, m, extra)
handler.help = ["umi-game-dungeon"]
handler.command = ["umi-game-dungeon", "umi-dungeon", "umi-dg", "umi-labirin", "dg", "labirin"]
handler.tags = ["game"]
handler.description = "Jelajahi dungeon dan lawan monster secara interaktif"
handler.importSource = "umi"
handler.importConfig = {"name": "dungeon", "alias": ["dg", "explore", "labirin"], "category": "game", "description": "Jelajahi dungeon dan lawan monster secara interaktif", "usage": ".dungeon", "example": ".dungeon", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-game-dungeon": "dungeon", "umi-dungeon": "dungeon", "umi-dg": "dg", "umi-labirin": "labirin", "dg": "dg", "labirin": "labirin"}
export default handler
