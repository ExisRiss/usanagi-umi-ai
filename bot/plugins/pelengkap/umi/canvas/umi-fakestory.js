/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakestory", "category": "canvas", "aliasMap": {"umi-canvas-fakestory": "fakestory", "umi-fakestory": "fakestory", "umi-fstory": "fstory", "umi-fakeinsta": "fakeinsta", "fstory": "fstory", "fakeinsta": "fakeinsta"}, "description": "Membuat fake Instagram story dengan 2 gambar", "usage": ".fakestory <nama>", "example": ".fakestory Misaki (reply 2 gambar)", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakestory.js", metadata, m, extra)
handler.help = ["umi-canvas-fakestory <nama>"]
handler.command = ["umi-canvas-fakestory", "umi-fakestory", "umi-fstory", "umi-fakeinsta", "fstory", "fakeinsta"]
handler.tags = ["canvas"]
handler.description = "Membuat fake Instagram story dengan 2 gambar"
handler.importSource = "umi"
handler.importConfig = {"name": "fakestory", "alias": ["fstory", "fakeinsta", "igstory"], "category": "canvas", "description": "Membuat fake Instagram story dengan 2 gambar", "usage": ".fakestory <nama>", "example": ".fakestory Misaki (reply 2 gambar)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakestory": "fakestory", "umi-fakestory": "fakestory", "umi-fstory": "fstory", "umi-fakeinsta": "fakeinsta", "fstory": "fstory", "fakeinsta": "fakeinsta"}
export default handler
