/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "arena", "category": "rpg", "aliasMap": {"umi-rpg-arena": "arena", "umi-arena": "arena", "umi-battle": "battle"}, "description": "Bertarung di arena PvP", "usage": ".arena <@user>", "example": ".arena @user", "cooldown": 180, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/arena.js", metadata, m, extra)
handler.help = ["umi-rpg-arena <@user>"]
handler.command = ["umi-rpg-arena", "umi-arena", "umi-battle"]
handler.tags = ["rpg"]
handler.description = "Bertarung di arena PvP"
handler.importSource = "umi"
handler.importConfig = {"name": "arena", "alias": ["pvp", "battle", "fight"], "category": "rpg", "description": "Bertarung di arena PvP", "usage": ".arena <@user>", "example": ".arena @user", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 180, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-arena": "arena", "umi-arena": "arena", "umi-battle": "battle"}
export default handler
