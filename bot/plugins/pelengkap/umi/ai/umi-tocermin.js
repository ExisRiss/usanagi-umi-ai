/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tocermin", "category": "ai", "aliasMap": {"umi-ai-tocermin": "tocermin", "umi-tocermin": "tocermin", "umi-mirror": "mirror", "umi-tomirror": "tomirror", "tocermin": "tocermin", "mirror": "mirror"}, "description": "Ubah foto menjadi efek cermin (mirror reflection)", "usage": ".tocermin (reply/kirim gambar)", "example": ".tocermin", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/tocermin.js", metadata, m, extra)
handler.help = ["umi-ai-tocermin (reply/kirim gambar)"]
handler.command = ["umi-ai-tocermin", "umi-tocermin", "umi-mirror", "umi-tomirror", "tocermin", "mirror"]
handler.tags = ["ai"]
handler.description = "Ubah foto menjadi efek cermin (mirror reflection)"
handler.importSource = "umi"
handler.importConfig = {"name": "tocermin", "alias": ["mirror", "tomirror"], "category": "ai", "description": "Ubah foto menjadi efek cermin (mirror reflection)", "usage": ".tocermin (reply/kirim gambar)", "example": ".tocermin", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-tocermin": "tocermin", "umi-tocermin": "tocermin", "umi-mirror": "mirror", "umi-tomirror": "tomirror", "tocermin": "tocermin", "mirror": "mirror"}
export default handler
