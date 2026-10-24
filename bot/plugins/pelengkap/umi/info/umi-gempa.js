/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gempa", "category": "info", "aliasMap": {"umi-info-gempa": "gempa", "umi-gempa": "gempa", "umi-bmkg": "bmkg", "umi-infogempa": "infogempa", "umi-earthquake": "earthquake", "bmkg": "bmkg", "infogempa": "infogempa", "earthquake": "earthquake"}, "description": "Info gempa terkini dari BMKG", "usage": ".gempa", "example": ".gempa", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/gempa.js", metadata, m, extra)
handler.help = ["umi-info-gempa"]
handler.command = ["umi-info-gempa", "umi-gempa", "umi-bmkg", "umi-infogempa", "umi-earthquake", "bmkg", "infogempa", "earthquake"]
handler.tags = ["info"]
handler.description = "Info gempa terkini dari BMKG"
handler.importSource = "umi"
handler.importConfig = {"name": "gempa", "alias": ["bmkg", "infogempa", "earthquake"], "category": "info", "description": "Info gempa terkini dari BMKG", "usage": ".gempa", "example": ".gempa", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-info-gempa": "gempa", "umi-gempa": "gempa", "umi-bmkg": "bmkg", "umi-infogempa": "infogempa", "umi-earthquake": "earthquake", "bmkg": "bmkg", "infogempa": "infogempa", "earthquake": "earthquake"}
export default handler
