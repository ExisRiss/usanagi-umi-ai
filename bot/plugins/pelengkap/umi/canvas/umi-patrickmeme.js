import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "patrickmeme", "category": "canvas", "aliasMap": {"umi-canvas-patrickmeme": "patrickmeme", "umi-patrickmeme": "patrickmeme", "umi-pmeme": "pmeme", "umi-memepatrick": "memepatrick", "patrickmeme": "patrickmeme", "pmeme": "pmeme", "memepatrick": "memepatrick"}, "description": "Membuat meme patrick dengan teks kustom", "usage": ".patrickmeme nama|teks", "example": ".patrickmeme Rin|Katanya just friend kok manggil sayang", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/patrickmeme.js", metadata, m, extra)
handler.help = ["umi-canvas-patrickmeme nama|teks"]
handler.command = ["umi-canvas-patrickmeme", "umi-patrickmeme", "umi-pmeme", "umi-memepatrick", "patrickmeme", "pmeme", "memepatrick"]
handler.tags = ["canvas"]
handler.description = "Membuat meme patrick dengan teks kustom"
handler.importSource = "umi"
handler.importConfig = {"name": "patrickmeme", "alias": ["pmeme", "memepatrick"], "category": "canvas", "description": "Membuat meme patrick dengan teks kustom", "usage": ".patrickmeme nama|teks", "example": ".patrickmeme Rin|Katanya just friend kok manggil sayang", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-patrickmeme": "patrickmeme", "umi-patrickmeme": "patrickmeme", "umi-pmeme": "pmeme", "umi-memepatrick": "memepatrick", "patrickmeme": "patrickmeme", "pmeme": "pmeme", "memepatrick": "memepatrick"}
export default handler
