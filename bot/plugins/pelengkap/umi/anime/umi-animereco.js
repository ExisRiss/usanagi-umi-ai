import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "animereco", "category": "anime", "aliasMap": {"umi-anime-animereco": "animereco", "umi-animereco": "animereco", "umi-animekomen": "animekomen", "umi-rekomenanime": "rekomenanime", "umi-animerank": "animerank", "umi-recoanime": "recoanime", "animereco": "animereco", "animekomen": "animekomen", "rekomenanime": "rekomenanime", "animerank": "animerank", "recoanime": "recoanime"}, "description": "Dapat rekomendasi anime berdasarkan genre atau top rating", "usage": ".animereco [genre]", "example": ".animereco\n.animereco action\n.animereco romance\n.animereco top", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/animereco.js", metadata, m, extra)
handler.help = ["umi-anime-animereco [genre]"]
handler.command = ["umi-anime-animereco", "umi-animereco", "umi-animekomen", "umi-rekomenanime", "umi-animerank", "umi-recoanime", "animereco", "animekomen", "rekomenanime", "animerank", "recoanime"]
handler.tags = ["anime"]
handler.description = "Dapat rekomendasi anime berdasarkan genre atau top rating"
handler.importSource = "umi"
handler.importConfig = {"name": "animereco", "alias": ["animekomen", "rekomenanime", "animerank", "recoanime"], "category": "anime", "description": "Dapat rekomendasi anime berdasarkan genre atau top rating", "usage": ".animereco [genre]", "example": ".animereco\n.animereco action\n.animereco romance\n.animereco top", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-animereco": "animereco", "umi-animereco": "animereco", "umi-animekomen": "animekomen", "umi-rekomenanime": "rekomenanime", "umi-animerank": "animerank", "umi-recoanime": "recoanime", "animereco": "animereco", "animekomen": "animekomen", "rekomenanime": "rekomenanime", "animerank": "animerank", "recoanime": "recoanime"}
export default handler
