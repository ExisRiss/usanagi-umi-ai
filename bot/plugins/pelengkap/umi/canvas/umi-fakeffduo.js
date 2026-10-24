import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeffduo", "category": "canvas", "aliasMap": {"umi-canvas-fakeffduo": "fakeffduo", "umi-fakeffduo": "fakeffduo"}, "description": "Bikin gambar banner Fake FF (Duo)", "usage": ".fakeffduo <nama1>|<nama2>|[bgNum]", "example": ".fakeffduo Fauzan|Bot|1", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeffduo.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeffduo <nama1>|<nama2>|[bgNum]"]
handler.command = ["umi-canvas-fakeffduo", "umi-fakeffduo"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar banner Fake FF (Duo)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeffduo", "alias": [], "category": "canvas", "description": "Bikin gambar banner Fake FF (Duo)", "usage": ".fakeffduo <nama1>|<nama2>|[bgNum]", "example": ".fakeffduo Fauzan|Bot|1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeffduo": "fakeffduo", "umi-fakeffduo": "fakeffduo"}
export default handler
