/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "burik", "category": "fun", "aliasMap": {"umi-fun-burik": "burik", "umi-burik": "burik", "umi-rusak": "rusak", "umi-jelek": "jelek", "burik": "burik", "rusak": "rusak"}, "description": "Membuat foto menjadi burik/rusak", "usage": ".burik (reply foto)", "example": ".burik (reply foto)", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/burik.js", metadata, m, extra)
handler.help = ["umi-fun-burik (reply foto)"]
handler.command = ["umi-fun-burik", "umi-burik", "umi-rusak", "umi-jelek", "burik", "rusak"]
handler.tags = ["fun"]
handler.description = "Membuat foto menjadi burik/rusak"
handler.importSource = "umi"
handler.importConfig = {"name": "burik", "alias": ["rusak", "jelek"], "category": "fun", "description": "Membuat foto menjadi burik/rusak", "usage": ".burik (reply foto)", "example": ".burik (reply foto)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-burik": "burik", "umi-burik": "burik", "umi-rusak": "rusak", "umi-jelek": "jelek", "burik": "burik", "rusak": "rusak"}
export default handler
