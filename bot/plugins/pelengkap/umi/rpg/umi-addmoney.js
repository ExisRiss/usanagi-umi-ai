import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addrpg", "category": "rpg", "aliasMap": {"umi-rpg-addrpg": "addrpg", "umi-addrpg": "addrpg", "addrpg": "addrpg"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/addmoney.js", metadata, m, extra)
handler.help = ["umi-rpg-addrpg"]
handler.command = ["umi-rpg-addrpg", "umi-addrpg", "addrpg"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "addrpg", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-addrpg": "addrpg", "umi-addrpg": "addrpg", "addrpg": "addrpg"}
export default handler
