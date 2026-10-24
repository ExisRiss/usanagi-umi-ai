import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "perangsarung", "category": "game", "aliasMap": {"umi-game-perangsarung": "perangsarung", "umi-perangsarung": "perangsarung", "perangsarung": "perangsarung"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/game/perangsarung.js", metadata, m, extra)
handler.help = ["umi-game-perangsarung"]
handler.command = ["umi-game-perangsarung", "umi-perangsarung", "perangsarung"]
handler.tags = ["game"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "perangsarung", "alias": [], "category": "game", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-game-perangsarung": "perangsarung", "umi-perangsarung": "perangsarung", "perangsarung": "perangsarung"}
export default handler
