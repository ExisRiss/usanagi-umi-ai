/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeovo", "category": "canvas", "aliasMap": {"umi-canvas-fakeovo": "fakeovo", "umi-fakeovo": "fakeovo", "umi-fake-ovo": "fake-ovo", "fakeovo": "fakeovo", "fake-ovo": "fake-ovo"}, "description": "Membuat canvas fake ovo", "usage": ".fake-ovo <nama>", "example": ".fake-ovo Jokowi", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeovo.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeovo <nama>"]
handler.command = ["umi-canvas-fakeovo", "umi-fakeovo", "umi-fake-ovo", "fakeovo", "fake-ovo"]
handler.tags = ["canvas"]
handler.description = "Membuat canvas fake ovo"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeovo", "alias": ["fake-ovo", "fakeovo"], "category": "canvas", "description": "Membuat canvas fake ovo", "usage": ".fake-ovo <nama>", "example": ".fake-ovo Jokowi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeovo": "fakeovo", "umi-fakeovo": "fakeovo", "umi-fake-ovo": "fake-ovo", "fakeovo": "fakeovo", "fake-ovo": "fake-ovo"}
export default handler
