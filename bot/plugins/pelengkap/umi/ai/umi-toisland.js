/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "toisland", "category": "ai", "aliasMap": {"umi-ai-toisland": "toisland", "umi-toisland": "toisland", "umi-island": "island", "umi-tropical": "tropical", "toisland": "toisland", "island": "island", "tropical": "tropical"}, "description": "Ubah foto menjadi suasana pulau tropis", "usage": ".toisland (reply/kirim gambar)", "example": ".toisland", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/toisland.js", metadata, m, extra)
handler.help = ["umi-ai-toisland (reply/kirim gambar)"]
handler.command = ["umi-ai-toisland", "umi-toisland", "umi-island", "umi-tropical", "toisland", "island", "tropical"]
handler.tags = ["ai"]
handler.description = "Ubah foto menjadi suasana pulau tropis"
handler.importSource = "umi"
handler.importConfig = {"name": "toisland", "alias": ["island", "tropical"], "category": "ai", "description": "Ubah foto menjadi suasana pulau tropis", "usage": ".toisland (reply/kirim gambar)", "example": ".toisland", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-toisland": "toisland", "umi-toisland": "toisland", "umi-island": "island", "umi-tropical": "tropical", "toisland": "toisland", "island": "island", "tropical": "tropical"}
export default handler
