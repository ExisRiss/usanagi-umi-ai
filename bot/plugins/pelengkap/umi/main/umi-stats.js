import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stats", "category": "main", "aliasMap": {"umi-main-stats": "stats", "umi-botstats": "botstats", "umi-stat": "stat", "botstats": "botstats"}, "description": "Menampilkan statistik bot", "usage": ".stats", "example": ".stats", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/stats.js", metadata, m, extra)
handler.help = ["umi-main-stats"]
handler.command = ["umi-main-stats", "umi-botstats", "umi-stat", "botstats"]
handler.tags = ["main"]
handler.description = "Menampilkan statistik bot"
handler.importSource = "umi"
handler.importConfig = {"name": "stats", "alias": ["botstats", "status", "stat"], "category": "main", "description": "Menampilkan statistik bot", "usage": ".stats", "example": ".stats", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-stats": "stats", "umi-botstats": "botstats", "umi-stat": "stat", "botstats": "botstats"}
export default handler
