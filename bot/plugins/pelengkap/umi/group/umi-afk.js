/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "afk", "category": "group", "aliasMap": {"umi-group-afk": "afk", "umi-afk": "afk", "umi-away": "away", "umi-brb": "brb"}, "description": "Set status AFK dengan alasan", "usage": ".afk <alasan>", "example": ".afk lagi makan", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/afk.js", metadata, m, extra)
handler.help = ["umi-group-afk <alasan>"]
handler.command = ["umi-group-afk", "umi-afk", "umi-away", "umi-brb"]
handler.tags = ["group"]
handler.description = "Set status AFK dengan alasan"
handler.importSource = "umi"
handler.importConfig = {"name": "afk", "alias": ["away", "brb"], "category": "group", "description": "Set status AFK dengan alasan", "usage": ".afk <alasan>", "example": ".afk lagi makan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-afk": "afk", "umi-afk": "afk", "umi-away": "away", "umi-brb": "brb"}
export default handler
