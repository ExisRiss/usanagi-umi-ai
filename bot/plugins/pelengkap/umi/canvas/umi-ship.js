/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ship", "category": "canvas", "aliasMap": {"umi-canvas-ship": "ship"}, "description": "Buat gambar persentase jodoh", "usage": ".ship @tag1 @tag2", "example": ".ship @tag1 @tag2", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/ship.js", metadata, m, extra)
handler.help = ["umi-canvas-ship @tag1 @tag2"]
handler.command = ["umi-canvas-ship"]
handler.tags = ["canvas"]
handler.description = "Buat gambar persentase jodoh"
handler.importSource = "umi"
handler.importConfig = {"name": "ship", "alias": ["ship", "jodoh"], "category": "canvas", "description": "Buat gambar persentase jodoh", "usage": ".ship @tag1 @tag2", "example": ".ship @tag1 @tag2", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-ship": "ship"}
export default handler
