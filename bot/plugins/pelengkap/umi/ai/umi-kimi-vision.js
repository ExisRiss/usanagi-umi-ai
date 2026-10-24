/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kimi-vision", "category": "ai", "aliasMap": {"umi-ai-kimi-vision": "kimi-vision", "umi-kimi-vision": "kimi-vision", "umi-kimivision": "kimivision", "umi-kimi-v": "kimi-v", "kimi-vision": "kimi-vision", "kimivision": "kimivision", "kimi-v": "kimi-v"}, "description": "Analisis gambar memakai Kimi Vision", "usage": ".kimi-vision <pertanyaan> (reply gambar)", "example": ".kimi-vision jelaskan gambar ini", "cooldown": 15, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/kimi-vision.js", metadata, m, extra)
handler.help = ["umi-ai-kimi-vision <pertanyaan> (reply gambar)"]
handler.command = ["umi-ai-kimi-vision", "umi-kimi-vision", "umi-kimivision", "umi-kimi-v", "kimi-vision", "kimivision", "kimi-v"]
handler.tags = ["ai"]
handler.description = "Analisis gambar memakai Kimi Vision"
handler.importSource = "umi"
handler.importConfig = {"name": "kimi-vision", "alias": ["kimivision", "kimi-v"], "category": "ai", "description": "Analisis gambar memakai Kimi Vision", "usage": ".kimi-vision <pertanyaan> (reply gambar)", "example": ".kimi-vision jelaskan gambar ini", "isPremium": false, "cooldown": 15, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-kimi-vision": "kimi-vision", "umi-kimi-vision": "kimi-vision", "umi-kimivision": "kimivision", "umi-kimi-v": "kimi-v", "kimi-vision": "kimi-vision", "kimivision": "kimivision", "kimi-v": "kimi-v"}
export default handler
