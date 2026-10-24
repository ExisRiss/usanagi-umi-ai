import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakenikah", "category": "canvas", "aliasMap": {"umi-canvas-fakenikah": "fakenikah", "umi-fakenikah": "fakenikah", "umi-nikahfake": "nikahfake", "umi-fakemarriage": "fakemarriage", "fakenikah": "fakenikah", "nikahfake": "nikahfake", "fakemarriage": "fakemarriage"}, "description": "Bikin fake sertifikat nikah (buat konten/gaguan doang)", "usage": ".fakenikah <nama1> | <nama2>", "example": ".fakenikah Umi | Darling", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakenikah.js", metadata, m, extra)
handler.help = ["umi-canvas-fakenikah <nama1> | <nama2>"]
handler.command = ["umi-canvas-fakenikah", "umi-fakenikah", "umi-nikahfake", "umi-fakemarriage", "fakenikah", "nikahfake", "fakemarriage"]
handler.tags = ["canvas"]
handler.description = "Bikin fake sertifikat nikah (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "fakenikah", "alias": ["nikahfake", "fakemarriage"], "category": "canvas", "description": "Bikin fake sertifikat nikah (buat konten/gaguan doang)", "usage": ".fakenikah <nama1> | <nama2>", "example": ".fakenikah Umi | Darling", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakenikah": "fakenikah", "umi-fakenikah": "fakenikah", "umi-nikahfake": "nikahfake", "umi-fakemarriage": "fakemarriage", "fakenikah": "fakenikah", "nikahfake": "nikahfake", "fakemarriage": "fakemarriage"}
export default handler
