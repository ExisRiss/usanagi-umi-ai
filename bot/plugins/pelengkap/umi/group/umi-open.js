/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "open", "category": "group", "aliasMap": {"umi-group-open": "open", "umi-buka": "buka", "umi-opengroup": "opengroup", "umi-bukagroup": "bukagroup", "opengroup": "opengroup", "bukagroup": "bukagroup"}, "description": "Membuka grup agar semua member bisa chat", "usage": ".open", "example": ".open", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/open.js", metadata, m, extra)
handler.help = ["umi-group-open"]
handler.command = ["umi-group-open", "umi-buka", "umi-opengroup", "umi-bukagroup", "opengroup", "bukagroup"]
handler.tags = ["group"]
handler.description = "Membuka grup agar semua member bisa chat"
handler.importSource = "umi"
handler.importConfig = {"name": "open", "alias": ["buka", "opengroup", "bukagroup"], "category": "group", "description": "Membuka grup agar semua member bisa chat", "usage": ".open", "example": ".open", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-open": "open", "umi-buka": "buka", "umi-opengroup": "opengroup", "umi-bukagroup": "bukagroup", "opengroup": "opengroup", "bukagroup": "bukagroup"}
export default handler
