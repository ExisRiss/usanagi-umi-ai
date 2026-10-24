/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "musicmaker", "category": "ai", "aliasMap": {"umi-ai-musicmaker": "musicmaker", "umi-musicmaker": "musicmaker", "umi-bikinlagu": "bikinlagu", "umi-suno": "suno", "musicmaker": "musicmaker", "bikinlagu": "bikinlagu", "suno": "suno"}, "description": "Membuat musik atau lagu menggunakan AI dari teks (prompt)", "usage": ".musicmaker <prompt>", "example": ".musicmaker Lagu sedih tentang perpisahan dengan musik piano", "cooldown": 30, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/musicmaker.js", metadata, m, extra)
handler.help = ["umi-ai-musicmaker <prompt>"]
handler.command = ["umi-ai-musicmaker", "umi-musicmaker", "umi-bikinlagu", "umi-suno", "musicmaker", "bikinlagu", "suno"]
handler.tags = ["ai"]
handler.description = "Membuat musik atau lagu menggunakan AI dari teks (prompt)"
handler.importSource = "umi"
handler.importConfig = {"name": "musicmaker", "alias": ["bikinlagu", "suno"], "category": "ai", "description": "Membuat musik atau lagu menggunakan AI dari teks (prompt)", "usage": ".musicmaker <prompt>", "example": ".musicmaker Lagu sedih tentang perpisahan dengan musik piano", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-musicmaker": "musicmaker", "umi-musicmaker": "musicmaker", "umi-bikinlagu": "bikinlagu", "umi-suno": "suno", "musicmaker": "musicmaker", "bikinlagu": "bikinlagu", "suno": "suno"}
export default handler
