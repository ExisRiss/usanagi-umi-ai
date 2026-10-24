import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "blacksmith", "category": "rpg", "aliasMap": {"umi-rpg-blacksmith": "blacksmith", "umi-blacksmith": "blacksmith", "umi-tempa": "tempa", "umi-forge": "forge", "umi-pandai": "pandai"}, "description": "Tempa senjata dan armor dari material", "usage": ".blacksmith <item>", "example": ".blacksmith sword", "cooldown": 120, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/blacksmith.js", metadata, m, extra)
handler.help = ["umi-rpg-blacksmith <item>"]
handler.command = ["umi-rpg-blacksmith", "umi-blacksmith", "umi-tempa", "umi-forge", "umi-pandai"]
handler.tags = ["rpg"]
handler.description = "Tempa senjata dan armor dari material"
handler.importSource = "umi"
handler.importConfig = {"name": "blacksmith", "alias": ["tempa", "forge", "pandai"], "category": "rpg", "description": "Tempa senjata dan armor dari material", "usage": ".blacksmith <item>", "example": ".blacksmith sword", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-blacksmith": "blacksmith", "umi-blacksmith": "blacksmith", "umi-tempa": "tempa", "umi-forge": "forge", "umi-pandai": "pandai"}
export default handler
