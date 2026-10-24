/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "meme3", "category": "canvas", "aliasMap": {"umi-canvas-meme3": "meme3", "umi-meme3": "meme3", "umi-3panel": "3panel", "meme3": "meme3", "3panel": "3panel"}, "description": "Membuat meme 3 panel", "usage": ".meme3 <text1>|<text2>|<text3>", "example": ".meme3 Kemarin ada apa?|Gak tau mau tidur|Kemaren kan lu belom beli", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/meme3.js", metadata, m, extra)
handler.help = ["umi-canvas-meme3 <text1>|<text2>|<text3>"]
handler.command = ["umi-canvas-meme3", "umi-meme3", "umi-3panel", "meme3", "3panel"]
handler.tags = ["canvas"]
handler.description = "Membuat meme 3 panel"
handler.importSource = "umi"
handler.importConfig = {"name": "meme3", "alias": ["3panel"], "category": "canvas", "description": "Membuat meme 3 panel", "usage": ".meme3 <text1>|<text2>|<text3>", "example": ".meme3 Kemarin ada apa?|Gak tau mau tidur|Kemaren kan lu belom beli", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-meme3": "meme3", "umi-meme3": "meme3", "umi-3panel": "3panel", "meme3": "meme3", "3panel": "3panel"}
export default handler
