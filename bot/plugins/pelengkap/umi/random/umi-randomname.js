import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "randomname", "category": "random", "aliasMap": {"umi-random-randomname": "randomname", "umi-randomname": "randomname", "randomname": "randomname"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/random/randomname.js", metadata, m, extra)
handler.help = ["umi-random-randomname"]
handler.command = ["umi-random-randomname", "umi-randomname", "randomname"]
handler.tags = ["random"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "randomname", "alias": [], "category": "random", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-random-randomname": "randomname", "umi-randomname": "randomname", "randomname": "randomname"}
export default handler
