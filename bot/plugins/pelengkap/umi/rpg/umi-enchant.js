import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "enchant", "category": "rpg", "aliasMap": {"umi-rpg-enchant": "enchant", "umi-enchant": "enchant", "umi-upgrade": "upgrade", "umi-tingkatkan": "tingkatkan"}, "description": "Upgrade equipment dengan enchantment", "usage": ".enchant <item>", "example": ".enchant sword", "cooldown": 120, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/enchant.js", metadata, m, extra)
handler.help = ["umi-rpg-enchant <item>"]
handler.command = ["umi-rpg-enchant", "umi-enchant", "umi-upgrade", "umi-tingkatkan"]
handler.tags = ["rpg"]
handler.description = "Upgrade equipment dengan enchantment"
handler.importSource = "umi"
handler.importConfig = {"name": "enchant", "alias": ["upgrade", "enhance", "tingkatkan"], "category": "rpg", "description": "Upgrade equipment dengan enchantment", "usage": ".enchant <item>", "example": ".enchant sword", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-enchant": "enchant", "umi-enchant": "enchant", "umi-upgrade": "upgrade", "umi-tingkatkan": "tingkatkan"}
export default handler
