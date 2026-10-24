/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "topchat", "category": "group", "aliasMap": {"umi-group-topchat": "topchat", "umi-topchat": "topchat", "umi-chatstat": "chatstat", "umi-chatstats": "chatstats", "umi-totalchat": "totalchat", "topchat": "topchat", "chatstat": "chatstat", "chatstats": "chatstats"}, "description": "Lihat statistik chat member di grup", "usage": ".topchat", "example": ".topchat", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/topchat.js", metadata, m, extra)
handler.help = ["umi-group-topchat"]
handler.command = ["umi-group-topchat", "umi-topchat", "umi-chatstat", "umi-chatstats", "umi-totalchat", "topchat", "chatstat", "chatstats"]
handler.tags = ["group"]
handler.description = "Lihat statistik chat member di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "topchat", "alias": ["chatstat", "chatstats", "totalchat", "leaderboard"], "category": "group", "description": "Lihat statistik chat member di grup", "usage": ".topchat", "example": ".topchat", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-topchat": "topchat", "umi-topchat": "topchat", "umi-chatstat": "chatstat", "umi-chatstats": "chatstats", "umi-totalchat": "totalchat", "topchat": "topchat", "chatstat": "chatstat", "chatstats": "chatstats"}
export default handler
