/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakedev7", "category": "canvas", "aliasMap": {"umi-canvas-fakedev7": "fakedev7", "umi-fakedev7": "fakedev7", "fakedev7": "fakedev7"}, "description": "Membuat fake developer (Python Theme)", "usage": ".fakedev7 <nama> (reply/kirim foto)", "example": ".fakedev7 Misaki", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakedev7.js", metadata, m, extra)
handler.help = ["umi-canvas-fakedev7 <nama> (reply/kirim foto)"]
handler.command = ["umi-canvas-fakedev7", "umi-fakedev7", "fakedev7"]
handler.tags = ["canvas"]
handler.description = "Membuat fake developer (Python Theme)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakedev7", "alias": [], "category": "canvas", "description": "Membuat fake developer (Python Theme)", "usage": ".fakedev7 <nama> (reply/kirim foto)", "example": ".fakedev7 Misaki", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakedev7": "fakedev7", "umi-fakedev7": "fakedev7", "fakedev7": "fakedev7"}
export default handler
