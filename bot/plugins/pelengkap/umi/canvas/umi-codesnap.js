/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "codesnap", "category": "canvas", "aliasMap": {"umi-canvas-codesnap": "codesnap", "umi-codesnap": "codesnap"}, "description": "Bikin gambar cuplikan code", "usage": ".codesnap <code>", "example": ".codesnap console.log('hello')", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/codesnap.js", metadata, m, extra)
handler.help = ["umi-canvas-codesnap <code>"]
handler.command = ["umi-canvas-codesnap", "umi-codesnap"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar cuplikan code"
handler.importSource = "umi"
handler.importConfig = {"name": "codesnap", "alias": [], "category": "canvas", "description": "Bikin gambar cuplikan code", "usage": ".codesnap <code>", "example": ".codesnap console.log('hello')", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-codesnap": "codesnap", "umi-codesnap": "codesnap"}
export default handler
