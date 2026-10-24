import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "audioquran", "category": "religi", "aliasMap": {"umi-religi-audioquran": "audioquran", "umi-audio-quran": "audio-quran", "audio-quran": "audio-quran"}, "description": "Cari dan putar audio Al-Quran dari berbagai Qari (mp3quran)", "usage": ".audio-quran [mode] [args]", "example": ".audio-quran audio Sudais 1\n.audio-quran reciters\n.audio-quran suwar", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/religi/audioquran.js", metadata, m, extra)
handler.help = ["umi-religi-audioquran [mode] [args]"]
handler.command = ["umi-religi-audioquran", "umi-audio-quran", "audio-quran"]
handler.tags = ["religi"]
handler.description = "Cari dan putar audio Al-Quran dari berbagai Qari (mp3quran)"
handler.importSource = "umi"
handler.importConfig = {"name": "audioquran", "alias": ["audio-quran", "murottal"], "category": "religi", "description": "Cari dan putar audio Al-Quran dari berbagai Qari (mp3quran)", "usage": ".audio-quran [mode] [args]", "example": ".audio-quran audio Sudais 1\n.audio-quran reciters\n.audio-quran suwar", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-religi-audioquran": "audioquran", "umi-audio-quran": "audio-quran", "audio-quran": "audio-quran"}
export default handler
