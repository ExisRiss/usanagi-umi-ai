import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "adventure", "category": "rpg", "aliasMap": {"umi-rpg-adventure": "adventure", "umi-adventure": "adventure", "umi-adv": "adv", "umi-petualangan": "petualangan"}, "description": "Berpetualang untuk mendapat Exp dan hadiah", "usage": ".adventure", "example": ".adventure", "cooldown": 120, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/adventure.js", metadata, m, extra)
handler.help = ["umi-rpg-adventure"]
handler.command = ["umi-rpg-adventure", "umi-adventure", "umi-adv", "umi-petualangan"]
handler.tags = ["rpg"]
handler.description = "Berpetualang untuk mendapat Exp dan hadiah"
handler.importSource = "umi"
handler.importConfig = {"name": "adventure", "alias": ["adv", "petualangan"], "category": "rpg", "description": "Berpetualang untuk mendapat Exp dan hadiah", "usage": ".adventure", "example": ".adventure", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-adventure": "adventure", "umi-adventure": "adventure", "umi-adv": "adv", "umi-petualangan": "petualangan"}
export default handler
