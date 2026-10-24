import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rob", "category": "rpg", "aliasMap": {"umi-rpg-rob": "rob", "umi-rob": "rob", "umi-rampok": "rampok", "umi-mug": "mug"}, "description": "Rampok uang player lain (berisiko)", "usage": ".rob @user", "example": ".rob @user", "cooldown": 600, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/rob.js", metadata, m, extra)
handler.help = ["umi-rpg-rob @user"]
handler.command = ["umi-rpg-rob", "umi-rob", "umi-rampok", "umi-mug"]
handler.tags = ["rpg"]
handler.description = "Rampok uang player lain (berisiko)"
handler.importSource = "umi"
handler.importConfig = {"name": "rob", "alias": ["rampok", "mug"], "category": "rpg", "description": "Rampok uang player lain (berisiko)", "usage": ".rob @user", "example": ".rob @user", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 600, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-rob": "rob", "umi-rob": "rob", "umi-rampok": "rampok", "umi-mug": "mug"}
export default handler
