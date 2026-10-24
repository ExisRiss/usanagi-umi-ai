import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "quran", "category": "islamic", "aliasMap": {"umi-islamic-quran": "quran", "umi-quran": "quran", "umi-alquran": "alquran", "umi-bacaquran": "bacaquran", "quran": "quran", "surah": "surah", "alquran": "alquran", "bacaquran": "bacaquran"}, "description": "Baca ayat Al-Quran berdasarkan nama surah", "usage": ".quran <nama surah>", "example": ".quran al fatihah", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/quran.js", metadata, m, extra)
handler.help = ["umi-islamic-quran <nama surah>"]
handler.command = ["umi-islamic-quran", "umi-quran", "umi-alquran", "umi-bacaquran", "quran", "surah", "alquran", "bacaquran"]
handler.tags = ["islamic"]
handler.description = "Baca ayat Al-Quran berdasarkan nama surah"
handler.importSource = "umi"
handler.importConfig = {"name": "quran", "alias": ["surah", "alquran", "bacaquran"], "category": "islamic", "description": "Baca ayat Al-Quran berdasarkan nama surah", "usage": ".quran <nama surah>", "example": ".quran al fatihah", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-islamic-quran": "quran", "umi-quran": "quran", "umi-alquran": "alquran", "umi-bacaquran": "bacaquran", "quran": "quran", "surah": "surah", "alquran": "alquran", "bacaquran": "bacaquran"}
export default handler
