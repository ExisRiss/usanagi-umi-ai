import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakeijin", "category": "canvas", "aliasMap": {"umi-canvas-fakeijin": "fakeijin", "umi-fakeijin": "fakeijin", "umi-ijinfake": "ijinfake", "umi-suratijin": "suratijin", "umi-fakeizin": "fakeizin", "fakeijin": "fakeijin", "ijinfake": "ijinfake", "suratijin": "suratijin", "fakeizin": "fakeizin"}, "description": "Bikin fake surat ijin (buat konten/gaguan doang)", "usage": ".fakeijin <nama> | <alasan>", "example": ".fakeijin Umi | Sakit", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakeijin.js", metadata, m, extra)
handler.help = ["umi-canvas-fakeijin <nama> | <alasan>"]
handler.command = ["umi-canvas-fakeijin", "umi-fakeijin", "umi-ijinfake", "umi-suratijin", "umi-fakeizin", "fakeijin", "ijinfake", "suratijin", "fakeizin"]
handler.tags = ["canvas"]
handler.description = "Bikin fake surat ijin (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakeijin", "alias": ["ijinfake", "suratijin", "fakeizin"], "category": "canvas", "description": "Bikin fake surat ijin (buat konten/gaguan doang)", "usage": ".fakeijin <nama> | <alasan>", "example": ".fakeijin Umi | Sakit", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakeijin": "fakeijin", "umi-fakeijin": "fakeijin", "umi-ijinfake": "ijinfake", "umi-suratijin": "suratijin", "umi-fakeizin": "fakeizin", "fakeijin": "fakeijin", "ijinfake": "ijinfake", "suratijin": "suratijin", "fakeizin": "fakeizin"}
export default handler
