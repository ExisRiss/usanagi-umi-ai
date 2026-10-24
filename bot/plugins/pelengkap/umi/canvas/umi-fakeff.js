import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeff", "category": "canvas", "aliasMap": {"umi-canvas-fakeff": "fakeff", "umi-fakeff": "fakeff", "fakeff": "fakeff"}, "description": "Bikin gambar banner Fake FF (Solo)", "usage": ".fakeff <teks>|[bgNum]", "example": ".fakeff Fauzan|2", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeff.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeff <teks>|[bgNum]"]
handler.command = ["umi-canvas-fakeff", "umi-fakeff", "fakeff"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar banner Fake FF (Solo)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeff", "alias": [], "category": "canvas", "description": "Bikin gambar banner Fake FF (Solo)", "usage": ".fakeff <teks>|[bgNum]", "example": ".fakeff Fauzan|2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeff": "fakeff", "umi-fakeff": "fakeff", "fakeff": "fakeff"}
export default handler
