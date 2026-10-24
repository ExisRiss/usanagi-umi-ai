import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "duel", "category": "rpg", "aliasMap": {"umi-rpg-duel": "duel", "umi-duel": "duel"}, "description": "Duel PvP dengan player lain", "usage": ".duel @user <bet>", "example": ".duel @user 5000", "cooldown": 120, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/duel.js", metadata, m, extra)
handler.help = ["umi-rpg-duel @user <bet>"]
handler.command = ["umi-rpg-duel", "umi-duel"]
handler.tags = ["rpg"]
handler.description = "Duel PvP dengan player lain"
handler.importSource = "umi"
handler.importConfig = {"name": "duel", "alias": ["pvp", "fight"], "category": "rpg", "description": "Duel PvP dengan player lain", "usage": ".duel @user <bet>", "example": ".duel @user 5000", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 120, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-duel": "duel", "umi-duel": "duel"}
export default handler
