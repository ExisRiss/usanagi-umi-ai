import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cook", "category": "rpg", "aliasMap": {"umi-rpg-cook": "cook", "umi-cook": "cook", "umi-masak": "masak"}, "description": "Memasak makanan untuk menambah health", "usage": ".cook", "example": ".cook", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/cook.js", metadata, m, extra)
handler.help = ["umi-rpg-cook"]
handler.command = ["umi-rpg-cook", "umi-cook", "umi-masak"]
handler.tags = ["rpg"]
handler.description = "Memasak makanan untuk menambah health"
handler.importSource = "umi"
handler.importConfig = {"name": "cook", "alias": ["masak"], "category": "rpg", "description": "Memasak makanan untuk menambah health", "usage": ".cook", "example": ".cook", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-cook": "cook", "umi-cook": "cook", "umi-masak": "masak"}
export default handler
