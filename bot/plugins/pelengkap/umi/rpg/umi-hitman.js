import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bunuh", "category": "rpg", "aliasMap": {"umi-rpg-bunuh": "bunuh", "umi-bunuh": "bunuh", "umi-hitman": "hitman", "bunuh": "bunuh", "hitman": "hitman"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/hitman.js", metadata, m, extra)
handler.help = ["umi-rpg-bunuh"]
handler.command = ["umi-rpg-bunuh", "umi-bunuh", "umi-hitman", "bunuh", "hitman"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "bunuh", "alias": ["hitman"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-bunuh": "bunuh", "umi-bunuh": "bunuh", "umi-hitman": "hitman", "bunuh": "bunuh", "hitman": "hitman"}
export default handler
