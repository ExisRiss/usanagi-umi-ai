/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bcgc", "category": "owner", "aliasMap": {"umi-owner-bcgc": "bcgc", "umi-bcgc": "bcgc", "umi-broadcastgc": "broadcastgc", "umi-bcgroup": "bcgroup", "umi-jedabcgc": "jedabcgc", "umi-delaybcgc": "delaybcgc", "umi-setjedabcgc": "setjedabcgc", "umi-stopbcgc": "stopbcgc", "umi-stopbroadcastgc": "stopbroadcastgc", "bcgc": "bcgc", "broadcastgc": "broadcastgc", "bcgroup": "bcgroup", "jedabcgc": "jedabcgc", "delaybcgc": "delaybcgc", "setjedabcgc": "setjedabcgc", "stopbcgc": "stopbcgc", "stopbroadcastgc": "stopbroadcastgc"}, "description": "Broadcast pesan ke semua grup dengan dukungan semua jenis media", "usage": ".bcgc", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/bcgc.js", metadata, m, extra)
handler.help = ["umi-owner-bcgc"]
handler.command = ["umi-owner-bcgc", "umi-bcgc", "umi-broadcastgc", "umi-bcgroup", "umi-jedabcgc", "umi-delaybcgc", "umi-setjedabcgc", "umi-stopbcgc", "umi-stopbroadcastgc", "bcgc", "broadcastgc", "bcgroup", "jedabcgc", "delaybcgc", "setjedabcgc", "stopbcgc", "stopbroadcastgc"]
handler.tags = ["owner"]
handler.description = "Broadcast pesan ke semua grup dengan dukungan semua jenis media"
handler.importSource = "umi"
handler.importConfig = {"name": "bcgc", "alias": ["broadcastgc", "bcgroup", "jedabcgc", "delaybcgc", "setjedabcgc", "stopbcgc", "stopbroadcastgc"], "category": "owner", "description": "Broadcast pesan ke semua grup dengan dukungan semua jenis media", "usage": ".bcgc", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-bcgc": "bcgc", "umi-bcgc": "bcgc", "umi-broadcastgc": "broadcastgc", "umi-bcgroup": "bcgroup", "umi-jedabcgc": "jedabcgc", "umi-delaybcgc": "delaybcgc", "umi-setjedabcgc": "setjedabcgc", "umi-stopbcgc": "stopbcgc", "umi-stopbroadcastgc": "stopbroadcastgc", "bcgc": "bcgc", "broadcastgc": "broadcastgc", "bcgroup": "bcgroup", "jedabcgc": "jedabcgc", "delaybcgc": "delaybcgc", "setjedabcgc": "setjedabcgc", "stopbcgc": "stopbcgc", "stopbroadcastgc": "stopbroadcastgc"}
export default handler
