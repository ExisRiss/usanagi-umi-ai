/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakestory2", "category": "canvas", "aliasMap": {"umi-canvas-fakestory2": "fakestory2", "umi-fakestory2": "fakestory2", "umi-fstory2": "fstory2", "umi-igstory2": "igstory2", "fakestory2": "fakestory2", "fstory2": "fstory2", "igstory2": "igstory2"}, "description": "Fake Instagram story dengan 1 gambar full", "usage": ".fakestory2 <nama>", "example": ".fakestory2 Misaki (reply gambar)", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakestory2.js", metadata, m, extra)
handler.help = ["umi-canvas-fakestory2 <nama>"]
handler.command = ["umi-canvas-fakestory2", "umi-fakestory2", "umi-fstory2", "umi-igstory2", "fakestory2", "fstory2", "igstory2"]
handler.tags = ["canvas"]
handler.description = "Fake Instagram story dengan 1 gambar full"
handler.importSource = "umi"
handler.importConfig = {"name": "fakestory2", "alias": ["fstory2", "igstory2"], "category": "canvas", "description": "Fake Instagram story dengan 1 gambar full", "usage": ".fakestory2 <nama>", "example": ".fakestory2 Misaki (reply gambar)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakestory2": "fakestory2", "umi-fakestory2": "fakestory2", "umi-fstory2": "fstory2", "umi-igstory2": "igstory2", "fakestory2": "fakestory2", "fstory2": "fstory2", "igstory2": "igstory2"}
export default handler
