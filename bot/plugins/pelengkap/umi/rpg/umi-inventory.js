import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "inventory", "category": "rpg", "aliasMap": {"umi-rpg-inventory": "inventory", "umi-inventory": "inventory", "umi-inv": "inv", "umi-tas": "tas", "umi-bag": "bag"}, "description": "Melihat isi inventory RPG", "usage": ".inventory", "example": ".inventory", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/inventory.js", metadata, m, extra)
handler.help = ["umi-rpg-inventory"]
handler.command = ["umi-rpg-inventory", "umi-inventory", "umi-inv", "umi-tas", "umi-bag"]
handler.tags = ["rpg"]
handler.description = "Melihat isi inventory RPG"
handler.importSource = "umi"
handler.importConfig = {"name": "inventory", "alias": ["inv", "tas", "bag"], "category": "rpg", "description": "Melihat isi inventory RPG", "usage": ".inventory", "example": ".inventory", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-inventory": "inventory", "umi-inventory": "inventory", "umi-inv": "inv", "umi-tas": "tas", "umi-bag": "bag"}
export default handler
