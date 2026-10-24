import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeml", "category": "canvas", "aliasMap": {"umi-canvas-fakeml": "fakeml", "umi-fakeml": "fakeml", "umi-mlbbfake": "mlbbfake", "umi-mlcard": "mlcard", "umi-mlfake": "mlfake", "mlbbfake": "mlbbfake", "mlcard": "mlcard", "mlfake": "mlfake"}, "description": "Membuat fake ML profile card", "usage": ".fakeml <nama> (reply/kirim foto)", "example": ".fakeml Misaki", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeml.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeml <nama> (reply/kirim foto)"]
handler.command = ["umi-canvas-fakeml", "umi-fakeml", "umi-mlbbfake", "umi-mlcard", "umi-mlfake", "mlbbfake", "mlcard", "mlfake"]
handler.tags = ["canvas"]
handler.description = "Membuat fake ML profile card"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeml", "alias": ["mlbbfake", "mlcard", "mlfake"], "category": "canvas", "description": "Membuat fake ML profile card", "usage": ".fakeml <nama> (reply/kirim foto)", "example": ".fakeml Misaki", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeml": "fakeml", "umi-fakeml": "fakeml", "umi-mlbbfake": "mlbbfake", "umi-mlcard": "mlcard", "umi-mlfake": "mlfake", "mlbbfake": "mlbbfake", "mlcard": "mlcard", "mlfake": "mlfake"}
export default handler
