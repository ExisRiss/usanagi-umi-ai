/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "murrotal", "category": "islamic", "aliasMap": {"umi-islamic-murrotal": "murrotal", "umi-murrotal": "murrotal", "umi-quraudio": "quraudio", "murrotal": "murrotal", "murottal": "murottal", "audioquran": "audioquran", "quraudio": "quraudio"}, "description": "Dengarkan audio murottal Al-Quran berdasarkan surah", "usage": ".murrotal <nama surah>", "example": ".murrotal al fatihah", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/murrotal.js", metadata, m, extra)
handler.help = ["umi-islamic-murrotal <nama surah>"]
handler.command = ["umi-islamic-murrotal", "umi-murrotal", "umi-quraudio", "murrotal", "murottal", "audioquran", "quraudio"]
handler.tags = ["islamic"]
handler.description = "Dengarkan audio murottal Al-Quran berdasarkan surah"
handler.importSource = "umi"
handler.importConfig = {"name": "murrotal", "alias": ["murottal", "audioquran", "quraudio"], "category": "islamic", "description": "Dengarkan audio murottal Al-Quran berdasarkan surah", "usage": ".murrotal <nama surah>", "example": ".murrotal al fatihah", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-islamic-murrotal": "murrotal", "umi-murrotal": "murrotal", "umi-quraudio": "quraudio", "murrotal": "murrotal", "murottal": "murottal", "audioquran": "audioquran", "quraudio": "quraudio"}
export default handler
