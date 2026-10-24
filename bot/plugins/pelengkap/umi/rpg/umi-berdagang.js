import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "berdagang", "category": "rpg", "aliasMap": {"umi-rpg-berdagang": "berdagang", "umi-berdagang": "berdagang"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/berdagang.js", metadata, m, extra)
handler.help = ["umi-rpg-berdagang"]
handler.command = ["umi-rpg-berdagang", "umi-berdagang"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "berdagang", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-berdagang": "berdagang", "umi-berdagang": "berdagang"}
export default handler
