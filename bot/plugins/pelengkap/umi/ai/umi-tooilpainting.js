/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tooilpainting", "category": "ai", "aliasMap": {"umi-ai-tooilpainting": "tooilpainting", "umi-tooilpainting": "tooilpainting", "umi-oilpainting": "oilpainting", "umi-tooil": "tooil", "umi-oil": "oil", "tooilpainting": "tooilpainting", "oilpainting": "oilpainting", "tooil": "tooil", "oil": "oil"}, "description": "Ubah foto menjadi gaya lukisan minyak (oil painting)", "usage": ".tooilpainting (reply/kirim gambar)", "example": ".tooilpainting", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/tooilpainting.js", metadata, m, extra)
handler.help = ["umi-ai-tooilpainting (reply/kirim gambar)"]
handler.command = ["umi-ai-tooilpainting", "umi-tooilpainting", "umi-oilpainting", "umi-tooil", "umi-oil", "tooilpainting", "oilpainting", "tooil", "oil"]
handler.tags = ["ai"]
handler.description = "Ubah foto menjadi gaya lukisan minyak (oil painting)"
handler.importSource = "umi"
handler.importConfig = {"name": "tooilpainting", "alias": ["oilpainting", "tooil", "oil"], "category": "ai", "description": "Ubah foto menjadi gaya lukisan minyak (oil painting)", "usage": ".tooilpainting (reply/kirim gambar)", "example": ".tooilpainting", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-tooilpainting": "tooilpainting", "umi-tooilpainting": "tooilpainting", "umi-oilpainting": "oilpainting", "umi-tooil": "tooil", "umi-oil": "oil", "tooilpainting": "tooilpainting", "oilpainting": "oilpainting", "tooil": "tooil", "oil": "oil"}
export default handler
