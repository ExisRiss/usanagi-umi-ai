/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanwarhistory", "category": "clan", "aliasMap": {"umi-clan-clanwarhistory": "clanwarhistory", "umi-clanwarhistory": "clanwarhistory", "umi-warhistory": "warhistory", "umi-historywar": "historywar", "umi-riwayatwar": "riwayatwar", "clanwarhistory": "clanwarhistory", "warhistory": "warhistory", "historywar": "historywar", "riwayatwar": "riwayatwar"}, "description": "Lihat riwayat clan war", "usage": ".clanwarhistory", "example": ".clanwarhistory", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanwarhistory.js", metadata, m, extra)
handler.help = ["umi-clan-clanwarhistory"]
handler.command = ["umi-clan-clanwarhistory", "umi-clanwarhistory", "umi-warhistory", "umi-historywar", "umi-riwayatwar", "clanwarhistory", "warhistory", "historywar", "riwayatwar"]
handler.tags = ["clan"]
handler.description = "Lihat riwayat clan war"
handler.importSource = "umi"
handler.importConfig = {"name": "clanwarhistory", "alias": ["warhistory", "historywar", "riwayatwar"], "category": "clan", "description": "Lihat riwayat clan war", "usage": ".clanwarhistory", "example": ".clanwarhistory", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanwarhistory": "clanwarhistory", "umi-clanwarhistory": "clanwarhistory", "umi-warhistory": "warhistory", "umi-historywar": "historywar", "umi-riwayatwar": "riwayatwar", "clanwarhistory": "clanwarhistory", "warhistory": "warhistory", "historywar": "historywar", "riwayatwar": "riwayatwar"}
export default handler
