import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakesp", "category": "canvas", "aliasMap": {"umi-canvas-fakesp": "fakesp", "umi-fakesp": "fakesp", "umi-spfake": "spfake", "umi-suratpanggilan": "suratpanggilan", "umi-fakesuratpanggil": "fakesuratpanggil", "fakesp": "fakesp", "spfake": "spfake", "suratpanggilan": "suratpanggilan", "fakesuratpanggil": "fakesuratpanggil"}, "description": "Bikin fake surat panggilan (buat konten/gaguan doang)", "usage": ".fakesp <nama> | <instansi>", "example": ".fakesp Umi | OSIS", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakesp.js", metadata, m, extra)
handler.help = ["umi-canvas-fakesp <nama> | <instansi>"]
handler.command = ["umi-canvas-fakesp", "umi-fakesp", "umi-spfake", "umi-suratpanggilan", "umi-fakesuratpanggil", "fakesp", "spfake", "suratpanggilan", "fakesuratpanggil"]
handler.tags = ["canvas"]
handler.description = "Bikin fake surat panggilan (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakesp", "alias": ["spfake", "suratpanggilan", "fakesuratpanggil"], "category": "canvas", "description": "Bikin fake surat panggilan (buat konten/gaguan doang)", "usage": ".fakesp <nama> | <instansi>", "example": ".fakesp Umi | OSIS", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakesp": "fakesp", "umi-fakesp": "fakesp", "umi-spfake": "spfake", "umi-suratpanggilan": "suratpanggilan", "umi-fakesuratpanggil": "fakesuratpanggil", "fakesp": "fakesp", "spfake": "spfake", "suratpanggilan": "suratpanggilan", "fakesuratpanggil": "fakesuratpanggil"}
export default handler
