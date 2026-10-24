/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "leaderboard-orang-miskin", "category": "economy", "aliasMap": {"umi-economy-leaderboard-orang-miskin": "leaderboard-orang-miskin", "umi-leaderboard-orang-miskin": "leaderboard-orang-miskin", "umi-topmiskin": "topmiskin", "umi-orangmiskin": "orangmiskin", "umi-lbmiskin": "lbmiskin", "umi-poorest": "poorest", "umi-toppoor": "toppoor", "leaderboard-orang-miskin": "leaderboard-orang-miskin", "topmiskin": "topmiskin", "orangmiskin": "orangmiskin", "lbmiskin": "lbmiskin", "poorest": "poorest", "toppoor": "toppoor"}, "description": "Ranking orang paling miskin versi Umi 🗿💸", "usage": ".topmiskin", "example": ".topmiskin", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/economy/leaderboardorkismin.js", metadata, m, extra)
handler.help = ["umi-economy-leaderboard-orang-miskin"]
handler.command = ["umi-economy-leaderboard-orang-miskin", "umi-leaderboard-orang-miskin", "umi-topmiskin", "umi-orangmiskin", "umi-lbmiskin", "umi-poorest", "umi-toppoor", "leaderboard-orang-miskin", "topmiskin", "orangmiskin", "lbmiskin", "poorest", "toppoor"]
handler.tags = ["economy"]
handler.description = "Ranking orang paling miskin versi Umi 🗿💸"
handler.importSource = "umi"
handler.importConfig = {"name": "leaderboard-orang-miskin", "alias": ["topmiskin", "orangmiskin", "lbmiskin", "poorest", "toppoor"], "category": "economy", "description": "Ranking orang paling miskin versi Umi 🗿💸", "usage": ".topmiskin", "example": ".topmiskin", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-economy-leaderboard-orang-miskin": "leaderboard-orang-miskin", "umi-leaderboard-orang-miskin": "leaderboard-orang-miskin", "umi-topmiskin": "topmiskin", "umi-orangmiskin": "orangmiskin", "umi-lbmiskin": "lbmiskin", "umi-poorest": "poorest", "umi-toppoor": "toppoor", "leaderboard-orang-miskin": "leaderboard-orang-miskin", "topmiskin": "topmiskin", "orangmiskin": "orangmiskin", "lbmiskin": "lbmiskin", "poorest": "poorest", "toppoor": "toppoor"}
export default handler
