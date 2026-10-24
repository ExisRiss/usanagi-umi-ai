/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanraid", "category": "clan", "aliasMap": {"umi-clan-clanraid": "clanraid", "umi-clanraid": "clanraid", "umi-raid": "raid", "umi-clanevent": "clanevent", "clanraid": "clanraid", "raid": "raid", "clanevent": "clanevent"}, "description": "Mulai raid event clan", "usage": ".clanraid", "example": ".clanraid", "cooldown": 3600, "energi": 10}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanraid.js", metadata, m, extra)
handler.help = ["umi-clan-clanraid"]
handler.command = ["umi-clan-clanraid", "umi-clanraid", "umi-raid", "umi-clanevent", "clanraid", "raid", "clanevent"]
handler.tags = ["clan"]
handler.description = "Mulai raid event clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanraid", "alias": ["raid", "clanevent"], "category": "clan", "description": "Mulai raid event clan", "usage": ".clanraid", "example": ".clanraid", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3600, "energi": 10, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-clan-clanraid": "clanraid", "umi-clanraid": "clanraid", "umi-raid": "raid", "umi-clanevent": "clanevent", "clanraid": "clanraid", "raid": "raid", "clanevent": "clanevent"}
export default handler
