import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lottery", "category": "rpg", "aliasMap": {"umi-rpg-lottery": "lottery", "umi-lottery": "lottery", "umi-undian": "undian"}, "description": "Gacha/lottery untuk hadiah random", "usage": ".lottery <1/10>", "example": ".lottery 10", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/lottery.js", metadata, m, extra)
handler.help = ["umi-rpg-lottery <1/10>"]
handler.command = ["umi-rpg-lottery", "umi-lottery", "umi-undian"]
handler.tags = ["rpg"]
handler.description = "Gacha/lottery untuk hadiah random"
handler.importSource = "umi"
handler.importConfig = {"name": "lottery", "alias": ["gacha", "spin", "undian"], "category": "rpg", "description": "Gacha/lottery untuk hadiah random", "usage": ".lottery <1/10>", "example": ".lottery 10", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-lottery": "lottery", "umi-lottery": "lottery", "umi-undian": "undian"}
export default handler
