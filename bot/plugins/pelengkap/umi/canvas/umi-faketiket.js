import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "faketiket", "category": "canvas", "aliasMap": {"umi-canvas-faketiket": "faketiket", "umi-faketiket": "faketiket", "umi-tiketfake": "tiketfake", "umi-faketicket": "faketicket", "umi-fakepesawat": "fakepesawat", "faketiket": "faketiket", "tiketfake": "tiketfake", "faketicket": "faketicket", "fakepesawat": "fakepesawat"}, "description": "Bikin fake tiket pesawat (buat konten/gaguan doang)", "usage": ".faketiket <dari> | <tujuan> | <nama>", "example": ".faketiket Jakarta | Tokyo | Umi", "cooldown": 8, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/faketiket.js", metadata, m, extra)
handler.help = ["umi-canvas-faketiket <dari> | <tujuan> | <nama>"]
handler.command = ["umi-canvas-faketiket", "umi-faketiket", "umi-tiketfake", "umi-faketicket", "umi-fakepesawat", "faketiket", "tiketfake", "faketicket", "fakepesawat"]
handler.tags = ["canvas"]
handler.description = "Bikin fake tiket pesawat (buat konten/gaguan doang)"
handler.importSource = "umi"
handler.importConfig = {"name": "faketiket", "alias": ["tiketfake", "faketicket", "fakepesawat"], "category": "canvas", "description": "Bikin fake tiket pesawat (buat konten/gaguan doang)", "usage": ".faketiket <dari> | <tujuan> | <nama>", "example": ".faketiket Jakarta | Tokyo | Umi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 8, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-faketiket": "faketiket", "umi-faketiket": "faketiket", "umi-tiketfake": "tiketfake", "umi-faketicket": "faketicket", "umi-fakepesawat": "fakepesawat", "faketiket": "faketiket", "tiketfake": "tiketfake", "faketicket": "faketicket", "fakepesawat": "fakepesawat"}
export default handler
