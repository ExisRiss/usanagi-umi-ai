/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hourly", "category": "rpg", "aliasMap": {"umi-rpg-hourly": "hourly", "umi-hourly": "hourly", "umi-jam": "jam", "umi-perjam": "perjam"}, "description": "Klaim hadiah per jam", "usage": ".hourly", "example": ".hourly", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/hourly.js", metadata, m, extra)
handler.help = ["umi-rpg-hourly"]
handler.command = ["umi-rpg-hourly", "umi-hourly", "umi-jam", "umi-perjam"]
handler.tags = ["rpg"]
handler.description = "Klaim hadiah per jam"
handler.importSource = "umi"
handler.importConfig = {"name": "hourly", "alias": ["jam", "perjam"], "category": "rpg", "description": "Klaim hadiah per jam", "usage": ".hourly", "example": ".hourly", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-hourly": "hourly", "umi-hourly": "hourly", "umi-jam": "jam", "umi-perjam": "perjam"}
export default handler
