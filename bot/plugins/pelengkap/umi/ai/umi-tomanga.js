import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tomanga", "category": "ai", "aliasMap": {"umi-ai-tomanga": "tomanga", "umi-tomanga": "tomanga", "umi-manga": "manga", "umi-mangafy": "mangafy", "umi-mangastyle": "mangastyle", "mangafy": "mangafy", "mangastyle": "mangastyle"}, "description": "Ubah foto menjadi gaya manga Jepang", "usage": ".tomanga (reply/kirim gambar)", "example": ".tomanga", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/tomanga.js", metadata, m, extra)
handler.help = ["umi-ai-tomanga (reply/kirim gambar)"]
handler.command = ["umi-ai-tomanga", "umi-tomanga", "umi-manga", "umi-mangafy", "umi-mangastyle", "mangafy", "mangastyle"]
handler.tags = ["ai"]
handler.description = "Ubah foto menjadi gaya manga Jepang"
handler.importSource = "umi"
handler.importConfig = {"name": "tomanga", "alias": ["manga", "mangafy", "mangastyle"], "category": "ai", "description": "Ubah foto menjadi gaya manga Jepang", "usage": ".tomanga (reply/kirim gambar)", "example": ".tomanga", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-tomanga": "tomanga", "umi-tomanga": "tomanga", "umi-manga": "manga", "umi-mangafy": "mangafy", "umi-mangastyle": "mangastyle", "mangafy": "mangafy", "mangastyle": "mangastyle"}
export default handler
