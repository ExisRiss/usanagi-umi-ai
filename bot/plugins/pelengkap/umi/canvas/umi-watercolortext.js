/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "watercolortext", "category": "canvas", "aliasMap": {"umi-canvas-watercolortext": "watercolortext", "umi-watercolortext": "watercolortext", "umi-watercolor": "watercolor", "umi-wctext": "wctext", "watercolortext": "watercolortext", "watercolor": "watercolor", "wctext": "wctext"}, "description": "Buat gambar teks dengan efek watercolor", "usage": ".watercolortext <teks>", "example": ".watercolortext RIMURU", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/watercolortext.js", metadata, m, extra)
handler.help = ["umi-canvas-watercolortext <teks>"]
handler.command = ["umi-canvas-watercolortext", "umi-watercolortext", "umi-watercolor", "umi-wctext", "watercolortext", "watercolor", "wctext"]
handler.tags = ["canvas"]
handler.description = "Buat gambar teks dengan efek watercolor"
handler.importSource = "umi"
handler.importConfig = {"name": "watercolortext", "alias": ["watercolor", "wctext"], "category": "canvas", "description": "Buat gambar teks dengan efek watercolor", "usage": ".watercolortext <teks>", "example": ".watercolortext RIMURU", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-watercolortext": "watercolortext", "umi-watercolortext": "watercolortext", "umi-watercolor": "watercolor", "umi-wctext": "wctext", "watercolortext": "watercolortext", "watercolor": "watercolor", "wctext": "wctext"}
export default handler
