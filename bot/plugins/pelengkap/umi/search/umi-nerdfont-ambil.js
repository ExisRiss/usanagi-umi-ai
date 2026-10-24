/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nerdfont-ambil", "category": "search", "aliasMap": {"umi-search-nerdfont-ambil": "nerdfont-ambil", "umi-nerdfont-ambil": "nerdfont-ambil", "umi-dafont-ambil": "dafont-ambil", "umi-fontambil": "fontambil", "nerdfont-ambil": "nerdfont-ambil", "dafont-ambil": "dafont-ambil", "fontambil": "fontambil"}, "description": "Cari font di DaFont", "usage": ".nerdfont-ambil <query>", "example": ".nerdfont-ambil Coolvetica", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/nerdfont-ambil.js", metadata, m, extra)
handler.help = ["umi-search-nerdfont-ambil <query>"]
handler.command = ["umi-search-nerdfont-ambil", "umi-nerdfont-ambil", "umi-dafont-ambil", "umi-fontambil", "nerdfont-ambil", "dafont-ambil", "fontambil"]
handler.tags = ["search"]
handler.description = "Cari font di DaFont"
handler.importSource = "umi"
handler.importConfig = {"name": "nerdfont-ambil", "alias": ["dafont-ambil", "fontambil"], "category": "search", "description": "Cari font di DaFont", "usage": ".nerdfont-ambil <query>", "example": ".nerdfont-ambil Coolvetica", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-nerdfont-ambil": "nerdfont-ambil", "umi-nerdfont-ambil": "nerdfont-ambil", "umi-dafont-ambil": "dafont-ambil", "umi-fontambil": "fontambil", "nerdfont-ambil": "nerdfont-ambil", "dafont-ambil": "dafont-ambil", "fontambil": "fontambil"}
export default handler
