import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clancheckin", "category": "clan", "aliasMap": {"umi-clan-clancheckin": "clancheckin", "umi-clancheckin": "clancheckin", "umi-checkin": "checkin", "umi-dailyclan": "dailyclan", "clancheckin": "clancheckin", "checkin": "checkin", "dailyclan": "dailyclan"}, "description": "Checkin harian untuk dapet XP clan", "usage": ".clancheckin", "example": ".clancheckin", "cooldown": 86400, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanceckin.js", metadata, m, extra)
handler.help = ["umi-clan-clancheckin"]
handler.command = ["umi-clan-clancheckin", "umi-clancheckin", "umi-checkin", "umi-dailyclan", "clancheckin", "checkin", "dailyclan"]
handler.tags = ["clan"]
handler.description = "Checkin harian untuk dapet XP clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clancheckin", "alias": ["checkin", "dailyclan"], "category": "clan", "description": "Checkin harian untuk dapet XP clan", "usage": ".clancheckin", "example": ".clancheckin", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 86400, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clancheckin": "clancheckin", "umi-clancheckin": "clancheckin", "umi-checkin": "checkin", "umi-dailyclan": "dailyclan", "clancheckin": "clancheckin", "checkin": "checkin", "dailyclan": "dailyclan"}
export default handler
