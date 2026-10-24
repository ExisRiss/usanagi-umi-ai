/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "daily", "category": "rpg", "aliasMap": {"umi-rpg-daily": "daily"}, "description": "Klaim hadiah harian", "usage": ".daily", "example": ".daily", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/daily.js", metadata, m, extra)
handler.help = ["umi-rpg-daily"]
handler.command = ["umi-rpg-daily"]
handler.tags = ["rpg"]
handler.description = "Klaim hadiah harian"
handler.importSource = "umi"
handler.importConfig = {"name": "daily", "alias": ["harian", "claim"], "category": "rpg", "description": "Klaim hadiah harian", "usage": ".daily", "example": ".daily", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-daily": "daily"}
export default handler
