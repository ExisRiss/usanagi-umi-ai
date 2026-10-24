import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "casino", "category": "rpg", "aliasMap": {"umi-rpg-casino": "casino", "umi-casino": "casino", "umi-judi": "judi", "umi-gamble": "gamble"}, "description": "Bermain casino untuk judi", "usage": ".casino <jumlah>", "example": ".casino 10000", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/casino.js", metadata, m, extra)
handler.help = ["umi-rpg-casino <jumlah>"]
handler.command = ["umi-rpg-casino", "umi-casino", "umi-judi", "umi-gamble"]
handler.tags = ["rpg"]
handler.description = "Bermain casino untuk judi"
handler.importSource = "umi"
handler.importConfig = {"name": "casino", "alias": ["judi", "gamble"], "category": "rpg", "description": "Bermain casino untuk judi", "usage": ".casino <jumlah>", "example": ".casino 10000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-casino": "casino", "umi-casino": "casino", "umi-judi": "judi", "umi-gamble": "gamble"}
export default handler
