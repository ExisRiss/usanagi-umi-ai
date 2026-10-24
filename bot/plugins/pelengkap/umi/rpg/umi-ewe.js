import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ewe", "category": "rpg", "aliasMap": {"umi-rpg-ewe": "ewe", "umi-ewe": "ewe", "umi-anu": "anu", "ewe": "ewe", "anu": "anu"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/ewe.js", metadata, m, extra)
handler.help = ["umi-rpg-ewe"]
handler.command = ["umi-rpg-ewe", "umi-ewe", "umi-anu", "ewe", "anu"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ewe", "alias": ["anu"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-ewe": "ewe", "umi-ewe": "ewe", "umi-anu": "anu", "ewe": "ewe", "anu": "anu"}
export default handler
