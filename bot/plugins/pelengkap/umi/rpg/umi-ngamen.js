import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ngamen", "category": "rpg", "aliasMap": {"umi-rpg-ngamen": "ngamen", "umi-ngamen": "ngamen", "umi-nyanyi": "nyanyi", "umi-konser": "konser"}, "description": "Ngamen di jalanan untuk mencari koin", "usage": ".ngamen", "example": ".ngamen", "cooldown": 120, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/ngamen.js", metadata, m, extra)
handler.help = ["umi-rpg-ngamen"]
handler.command = ["umi-rpg-ngamen", "umi-ngamen", "umi-nyanyi", "umi-konser"]
handler.tags = ["rpg"]
handler.description = "Ngamen di jalanan untuk mencari koin"
handler.importSource = "umi"
handler.importConfig = {"name": "ngamen", "alias": ["nyanyi", "konser"], "category": "rpg", "description": "Ngamen di jalanan untuk mencari koin", "usage": ".ngamen", "example": ".ngamen", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-ngamen": "ngamen", "umi-ngamen": "ngamen", "umi-nyanyi": "nyanyi", "umi-konser": "konser"}
export default handler
