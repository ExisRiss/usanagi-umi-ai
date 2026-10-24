/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anischedule", "category": "anime", "aliasMap": {"umi-anime-anischedule": "anischedule", "umi-anischedule": "anischedule", "umi-animejadwal": "animejadwal", "umi-jadwalanime": "jadwalanime", "umi-animeday": "animeday", "anischedule": "anischedule", "animejadwal": "animejadwal", "jadwalanime": "jadwalanime", "animeday": "animeday"}, "description": "Menampilkan jadwal tayang anime musim ini (ambil dari API livechart)", "usage": ".anischedule [hari] [musim]", "example": ".anischedule\n.anischedule senin\n.anischedule spring-2025", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/anischedule.js", metadata, m, extra)
handler.help = ["umi-anime-anischedule [hari] [musim]"]
handler.command = ["umi-anime-anischedule", "umi-anischedule", "umi-animejadwal", "umi-jadwalanime", "umi-animeday", "anischedule", "animejadwal", "jadwalanime", "animeday"]
handler.tags = ["anime"]
handler.description = "Menampilkan jadwal tayang anime musim ini (ambil dari API livechart)"
handler.importSource = "umi"
handler.importConfig = {"name": "anischedule", "alias": ["animejadwal", "jadwalanime", "animeday"], "category": "anime", "description": "Menampilkan jadwal tayang anime musim ini (ambil dari API livechart)", "usage": ".anischedule [hari] [musim]", "example": ".anischedule\n.anischedule senin\n.anischedule spring-2025", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-anischedule": "anischedule", "umi-anischedule": "anischedule", "umi-animejadwal": "animejadwal", "umi-jadwalanime": "jadwalanime", "umi-animeday": "animeday", "anischedule": "anischedule", "animejadwal": "animejadwal", "jadwalanime": "jadwalanime", "animeday": "animeday"}
export default handler
