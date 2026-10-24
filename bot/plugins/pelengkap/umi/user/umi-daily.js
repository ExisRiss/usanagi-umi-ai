/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "daily", "category": "user", "aliasMap": {"umi-user-daily": "daily", "umi-bonus": "bonus", "bonus": "bonus"}, "description": "Claim hadiah harian (Exp, Money, Potion)", "usage": ".daily", "example": ".daily", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/daily.js", metadata, m, extra)
handler.help = ["umi-user-daily"]
handler.command = ["umi-user-daily", "umi-bonus", "bonus"]
handler.tags = ["user"]
handler.description = "Claim hadiah harian (Exp, Money, Potion)"
handler.importSource = "umi"
handler.importConfig = {"name": "daily", "alias": ["claim", "harian", "bonus"], "category": "user", "description": "Claim hadiah harian (Exp, Money, Potion)", "usage": ".daily", "example": ".daily", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-daily": "daily", "umi-bonus": "bonus", "bonus": "bonus"}
export default handler
