/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "age-detection", "category": "tools", "aliasMap": {"umi-tools-age-detection": "age-detection", "umi-age-detection": "age-detection", "umi-detectage": "detectage", "umi-age-detect": "age-detect", "age-detection": "age-detection", "detectage": "detectage", "age-detect": "age-detect"}, "description": "Deteksi perkiraan usia dari foto", "usage": ".age-detection (reply gambar)", "example": ".age-detection", "cooldown": 30, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/age-detection.js", metadata, m, extra)
handler.help = ["umi-tools-age-detection (reply gambar)"]
handler.command = ["umi-tools-age-detection", "umi-age-detection", "umi-detectage", "umi-age-detect", "age-detection", "detectage", "age-detect"]
handler.tags = ["tools"]
handler.description = "Deteksi perkiraan usia dari foto"
handler.importSource = "umi"
handler.importConfig = {"name": "age-detection", "alias": ["detectage", "age-detect"], "category": "tools", "description": "Deteksi perkiraan usia dari foto", "usage": ".age-detection (reply gambar)", "example": ".age-detection", "isPremium": true, "cooldown": 30, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-age-detection": "age-detection", "umi-age-detection": "age-detection", "umi-detectage": "detectage", "umi-age-detect": "age-detect", "age-detection": "age-detection", "detectage": "detectage", "age-detect": "age-detect"}
export default handler
