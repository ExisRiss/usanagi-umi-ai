/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "drakememe", "category": "canvas", "aliasMap": {"umi-canvas-drakememe": "drakememe", "umi-drakememe": "drakememe", "umi-drake": "drake", "umi-drakedislike": "drakedislike", "drakememe": "drakememe", "drake": "drake", "drakedislike": "drakedislike"}, "description": "Membuat meme Drake Hotline Bling dengan dua teks kustom", "usage": ".drakememe teks1|teks2", "example": ".drakememe Femboy|Tomboy", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/drakememe.js", metadata, m, extra)
handler.help = ["umi-canvas-drakememe teks1|teks2"]
handler.command = ["umi-canvas-drakememe", "umi-drakememe", "umi-drake", "umi-drakedislike", "drakememe", "drake", "drakedislike"]
handler.tags = ["canvas"]
handler.description = "Membuat meme Drake Hotline Bling dengan dua teks kustom"
handler.importSource = "umi"
handler.importConfig = {"name": "drakememe", "alias": ["drake", "drakedislike"], "category": "canvas", "description": "Membuat meme Drake Hotline Bling dengan dua teks kustom", "usage": ".drakememe teks1|teks2", "example": ".drakememe Femboy|Tomboy", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-drakememe": "drakememe", "umi-drakememe": "drakememe", "umi-drake": "drake", "umi-drakedislike": "drakedislike", "drakememe": "drakememe", "drake": "drake", "drakedislike": "drakedislike"}
export default handler
