/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakepaspor", "category": "canvas", "aliasMap": {"umi-canvas-fakepaspor": "fakepaspor", "umi-fakepaspor": "fakepaspor", "umi-pasporfake": "pasporfake", "umi-fakepassport": "fakepassport", "fakepaspor": "fakepaspor", "pasporfake": "pasporfake", "fakepassport": "fakepassport"}, "description": "Bikin fake paspor (buat konten/gaguan doang)", "usage": ".fakepaspor <nama> | <umur> | <negara>", "example": ".fakepaspor Umi | 20 | Jepang", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakepaspor.js", metadata, m, extra)
handler.help = ["umi-canvas-fakepaspor <nama> | <umur> | <negara>"]
handler.command = ["umi-canvas-fakepaspor", "umi-fakepaspor", "umi-pasporfake", "umi-fakepassport", "fakepaspor", "pasporfake", "fakepassport"]
handler.tags = ["canvas"]
handler.description = "Bikin fake paspor (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakepaspor", "alias": ["pasporfake", "fakepassport"], "category": "canvas", "description": "Bikin fake paspor (buat konten/gaguan doang)", "usage": ".fakepaspor <nama> | <umur> | <negara>", "example": ".fakepaspor Umi | 20 | Jepang", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakepaspor": "fakepaspor", "umi-fakepaspor": "fakepaspor", "umi-pasporfake": "pasporfake", "umi-fakepassport": "fakepassport", "fakepaspor": "fakepaspor", "pasporfake": "pasporfake", "fakepassport": "fakepassport"}
export default handler
