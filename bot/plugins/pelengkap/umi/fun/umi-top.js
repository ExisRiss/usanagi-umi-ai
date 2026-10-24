/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "top", "category": "fun", "aliasMap": {"umi-fun-top": "top", "umi-top5": "top5", "umi-toplist": "toplist"}, "description": "Random top 5 member untuk kategori tertentu", "usage": ".top <kategori>", "example": ".top orang pintar", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/top.js", metadata, m, extra)
handler.help = ["umi-fun-top <kategori>"]
handler.command = ["umi-fun-top", "umi-top5", "umi-toplist"]
handler.tags = ["fun"]
handler.description = "Random top 5 member untuk kategori tertentu"
handler.importSource = "umi"
handler.importConfig = {"name": "top", "alias": ["top5", "toplist"], "category": "fun", "description": "Random top 5 member untuk kategori tertentu", "usage": ".top <kategori>", "example": ".top orang pintar", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-top": "top", "umi-top5": "top5", "umi-toplist": "toplist"}
export default handler
