/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "rajab", "category": "religi", "aliasMap": {"umi-religi-rajab": "rajab", "umi-rajab": "rajab", "umi-bulanrajab": "bulanrajab", "rajab": "rajab", "bulanrajab": "bulanrajab"}, "description": "Informasi lengkap tentang Bulan Rajab (doa, amalan, keutamaan, dan peristiwa penting)", "usage": ".rajab", "example": ".rajab", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/rajab.js", metadata, m, extra)
handler.help = ["umi-religi-rajab"]
handler.command = ["umi-religi-rajab", "umi-rajab", "umi-bulanrajab", "rajab", "bulanrajab"]
handler.tags = ["religi"]
handler.description = "Informasi lengkap tentang Bulan Rajab (doa, amalan, keutamaan, dan peristiwa penting)"
handler.importSource = "umi"
handler.importConfig = {"name": "rajab", "alias": ["bulanrajab", "rajab"], "category": "religi", "description": "Informasi lengkap tentang Bulan Rajab (doa, amalan, keutamaan, dan peristiwa penting)", "usage": ".rajab", "example": ".rajab", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-rajab": "rajab", "umi-rajab": "rajab", "umi-bulanrajab": "bulanrajab", "rajab": "rajab", "bulanrajab": "bulanrajab"}
export default handler
