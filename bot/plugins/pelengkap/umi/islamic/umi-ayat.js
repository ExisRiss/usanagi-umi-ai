/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ayat", "category": "religi", "aliasMap": {"umi-religi-ayat": "ayat", "umi-ayat": "ayat", "umi-ayatpilihan": "ayatpilihan", "umi-suratpilihan": "suratpilihan", "ayat": "ayat", "ayatpilihan": "ayatpilihan", "suratpilihan": "suratpilihan"}, "description": "Kumpulan Ayat Pilihan Al-Quran (Arsy, Kursi, Ruqyah, dll)", "usage": ".ayat <nama ayat>", "example": ".ayat kursi", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/ayat.js", metadata, m, extra)
handler.help = ["umi-religi-ayat <nama ayat>"]
handler.command = ["umi-religi-ayat", "umi-ayat", "umi-ayatpilihan", "umi-suratpilihan", "ayat", "ayatpilihan", "suratpilihan"]
handler.tags = ["religi"]
handler.description = "Kumpulan Ayat Pilihan Al-Quran (Arsy, Kursi, Ruqyah, dll)"
handler.importSource = "umi"
handler.importConfig = {"name": "ayat", "alias": ["ayatpilihan", "suratpilihan"], "category": "religi", "description": "Kumpulan Ayat Pilihan Al-Quran (Arsy, Kursi, Ruqyah, dll)", "usage": ".ayat <nama ayat>", "example": ".ayat kursi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-ayat": "ayat", "umi-ayat": "ayat", "umi-ayatpilihan": "ayatpilihan", "umi-suratpilihan": "suratpilihan", "ayat": "ayat", "ayatpilihan": "ayatpilihan", "suratpilihan": "suratpilihan"}
export default handler
