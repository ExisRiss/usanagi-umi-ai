import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "livett", "category": "rpg", "aliasMap": {"umi-rpg-livett": "livett", "umi-livett": "livett", "livett": "livett"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/livett.js", metadata, m, extra)
handler.help = ["umi-rpg-livett"]
handler.command = ["umi-rpg-livett", "umi-livett", "livett"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "livett", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-livett": "livett", "umi-livett": "livett", "livett": "livett"}
export default handler
