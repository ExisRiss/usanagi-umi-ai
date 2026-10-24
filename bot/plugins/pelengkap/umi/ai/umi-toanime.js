import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "toanime", "category": "ai", "aliasMap": {"umi-ai-toanime": "toanime", "umi-toanime": "toanime", "umi-anime": "anime", "umi-animefy": "animefy", "umi-ghibli": "ghibli", "toanime": "toanime", "animefy": "animefy"}, "description": "Ubah foto menjadi gaya anime/Ghibli Studio", "usage": ".toanime (reply/kirim gambar)", "example": ".toanime", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/toanime.js", metadata, m, extra)
handler.help = ["umi-ai-toanime (reply/kirim gambar)"]
handler.command = ["umi-ai-toanime", "umi-toanime", "umi-anime", "umi-animefy", "umi-ghibli", "toanime", "animefy"]
handler.tags = ["ai"]
handler.description = "Ubah foto menjadi gaya anime/Ghibli Studio"
handler.importSource = "umi"
handler.importConfig = {"name": "toanime", "alias": ["anime", "animefy", "ghibli"], "category": "ai", "description": "Ubah foto menjadi gaya anime/Ghibli Studio", "usage": ".toanime (reply/kirim gambar)", "example": ".toanime", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-toanime": "toanime", "umi-toanime": "toanime", "umi-anime": "anime", "umi-animefy": "animefy", "umi-ghibli": "ghibli", "toanime": "toanime", "animefy": "animefy"}
export default handler
