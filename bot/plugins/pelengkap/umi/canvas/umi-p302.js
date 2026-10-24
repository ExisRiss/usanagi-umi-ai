/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "p302", "category": "canvas", "aliasMap": {"umi-canvas-p302": "p302", "umi-p302": "p302", "p302": "p302"}, "description": "Buat logo 3D metal (p302)", "usage": ".p302 <teks>", "example": ".p302 Fauzan", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/p302.js", metadata, m, extra)
handler.help = ["umi-canvas-p302 <teks>"]
handler.command = ["umi-canvas-p302", "umi-p302", "p302"]
handler.tags = ["canvas"]
handler.description = "Buat logo 3D metal (p302)"
handler.importSource = "umi"
handler.importConfig = {"name": "p302", "alias": ["p302"], "category": "canvas", "description": "Buat logo 3D metal (p302)", "usage": ".p302 <teks>", "example": ".p302 Fauzan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-p302": "p302", "umi-p302": "p302", "p302": "p302"}
export default handler
