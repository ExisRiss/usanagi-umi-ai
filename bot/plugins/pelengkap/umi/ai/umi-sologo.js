/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sologo", "category": "ai", "aliasMap": {"umi-ai-sologo": "sologo", "umi-sologo": "sologo", "umi-ailogo": "ailogo", "umi-bikinlogo": "bikinlogo", "sologo": "sologo", "ailogo": "ailogo", "bikinlogo": "bikinlogo"}, "description": "Membuat logo menggunakan AI dari teks (prompt)", "usage": ".sologo <prompt>", "example": ".sologo Kucing lucu warna biru", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/sologo.js", metadata, m, extra)
handler.help = ["umi-ai-sologo <prompt>"]
handler.command = ["umi-ai-sologo", "umi-sologo", "umi-ailogo", "umi-bikinlogo", "sologo", "ailogo", "bikinlogo"]
handler.tags = ["ai"]
handler.description = "Membuat logo menggunakan AI dari teks (prompt)"
handler.importSource = "umi"
handler.importConfig = {"name": "sologo", "alias": ["ailogo", "bikinlogo"], "category": "ai", "description": "Membuat logo menggunakan AI dari teks (prompt)", "usage": ".sologo <prompt>", "example": ".sologo Kucing lucu warna biru", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-sologo": "sologo", "umi-sologo": "sologo", "umi-ailogo": "ailogo", "umi-bikinlogo": "bikinlogo", "sologo": "sologo", "ailogo": "ailogo", "bikinlogo": "bikinlogo"}
export default handler
