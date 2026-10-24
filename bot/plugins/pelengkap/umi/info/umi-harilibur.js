/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "harilibur", "category": "info", "aliasMap": {"umi-info-harilibur": "harilibur", "umi-harilibur": "harilibur", "umi-libur": "libur", "umi-harinasional": "harinasional", "harilibur": "harilibur", "libur": "libur", "harinasional": "harinasional"}, "description": "Menampilkan informasi hari libur dan hari nasional mendatang", "usage": ".harilibur", "example": ".harilibur", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/harilibur.js", metadata, m, extra)
handler.help = ["umi-info-harilibur"]
handler.command = ["umi-info-harilibur", "umi-harilibur", "umi-libur", "umi-harinasional", "harilibur", "libur", "harinasional"]
handler.tags = ["info"]
handler.description = "Menampilkan informasi hari libur dan hari nasional mendatang"
handler.importSource = "umi"
handler.importConfig = {"name": "harilibur", "alias": ["libur", "harinasional"], "category": "info", "description": "Menampilkan informasi hari libur dan hari nasional mendatang", "usage": ".harilibur", "example": ".harilibur", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-harilibur": "harilibur", "umi-harilibur": "harilibur", "umi-libur": "libur", "umi-harinasional": "harinasional", "harilibur": "harilibur", "libur": "libur", "harinasional": "harinasional"}
export default handler
