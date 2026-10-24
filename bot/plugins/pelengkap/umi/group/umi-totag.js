/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "totag", "category": "group", "aliasMap": {"umi-group-totag": "totag", "umi-totag": "totag", "umi-tagall2": "tagall2", "umi-mentionall": "mentionall", "tagall2": "tagall2", "mentionall": "mentionall"}, "description": "Tag semua member dengan reply pesan", "usage": ".totag (reply pesan)", "example": ".totag", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/totag.js", metadata, m, extra)
handler.help = ["umi-group-totag (reply pesan)"]
handler.command = ["umi-group-totag", "umi-totag", "umi-tagall2", "umi-mentionall", "tagall2", "mentionall"]
handler.tags = ["group"]
handler.description = "Tag semua member dengan reply pesan"
handler.importSource = "umi"
handler.importConfig = {"name": "totag", "alias": ["tagall2", "mentionall"], "category": "group", "description": "Tag semua member dengan reply pesan", "usage": ".totag (reply pesan)", "example": ".totag", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-totag": "totag", "umi-totag": "totag", "umi-tagall2": "tagall2", "umi-mentionall": "mentionall", "tagall2": "tagall2", "mentionall": "mentionall"}
export default handler
