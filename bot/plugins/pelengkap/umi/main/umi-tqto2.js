/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tqto2", "category": "main", "aliasMap": {"umi-main-tqto2": "tqto2", "umi-tqto2": "tqto2", "umi-thanksto2": "thanksto2", "umi-credits2": "credits2", "umi-kredit2": "kredit2", "tqto2": "tqto2", "thanksto2": "thanksto2", "credits2": "credits2", "kredit2": "kredit2"}, "description": "Menampilkan daftar kontributor bot", "usage": ".tqto2", "example": ".tqto2", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/tqto2.js", metadata, m, extra)
handler.help = ["umi-main-tqto2"]
handler.command = ["umi-main-tqto2", "umi-tqto2", "umi-thanksto2", "umi-credits2", "umi-kredit2", "tqto2", "thanksto2", "credits2", "kredit2"]
handler.tags = ["main"]
handler.description = "Menampilkan daftar kontributor bot"
handler.importSource = "umi"
handler.importConfig = {"name": "tqto2", "alias": ["thanksto2", "credits2", "kredit2"], "category": "main", "description": "Menampilkan daftar kontributor bot", "usage": ".tqto2", "example": ".tqto2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-tqto2": "tqto2", "umi-tqto2": "tqto2", "umi-thanksto2": "thanksto2", "umi-credits2": "credits2", "umi-kredit2": "kredit2", "tqto2": "tqto2", "thanksto2": "thanksto2", "credits2": "credits2", "kredit2": "kredit2"}
export default handler
