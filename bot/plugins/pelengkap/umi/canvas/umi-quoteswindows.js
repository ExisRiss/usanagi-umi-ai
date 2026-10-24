/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "quoteswindows", "category": "canvas", "aliasMap": {"umi-canvas-quoteswindows": "quoteswindows", "umi-quoteswindows": "quoteswindows", "umi-wq": "wq", "umi-qwindows": "qwindows", "quoteswindows": "quoteswindows", "qwindows": "qwindows"}, "description": "Buat meme quotes bergaya Windows", "usage": ".wq <text>", "example": ".wq just friend kok manggil sayang dan cemburu", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/quoteswindows.js", metadata, m, extra)
handler.help = ["umi-canvas-quoteswindows <text>"]
handler.command = ["umi-canvas-quoteswindows", "umi-quoteswindows", "umi-wq", "umi-qwindows", "quoteswindows", "qwindows"]
handler.tags = ["canvas"]
handler.description = "Buat meme quotes bergaya Windows"
handler.importSource = "umi"
handler.importConfig = {"name": "quoteswindows", "alias": ["wq", "qwindows"], "category": "canvas", "description": "Buat meme quotes bergaya Windows", "usage": ".wq <text>", "example": ".wq just friend kok manggil sayang dan cemburu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-quoteswindows": "quoteswindows", "umi-quoteswindows": "quoteswindows", "umi-wq": "wq", "umi-qwindows": "qwindows", "quoteswindows": "quoteswindows", "qwindows": "qwindows"}
export default handler
