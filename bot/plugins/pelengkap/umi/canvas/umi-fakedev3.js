import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakedev3", "category": "canvas", "aliasMap": {"umi-canvas-fakedev3": "fakedev3", "umi-fakedev3": "fakedev3", "fakedev3": "fakedev3"}, "description": "Bikin gambar fakedev 3 dari fotomu", "usage": ".fakedev3 <teks> (reply/kirim foto)", "example": ".fakedev3 developer", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakedev3.js", metadata, m, extra)
handler.help = ["umi-canvas-fakedev3 <teks> (reply/kirim foto)"]
handler.command = ["umi-canvas-fakedev3", "umi-fakedev3", "fakedev3"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar fakedev 3 dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "fakedev3", "alias": [], "category": "canvas", "description": "Bikin gambar fakedev 3 dari fotomu", "usage": ".fakedev3 <teks> (reply/kirim foto)", "example": ".fakedev3 developer", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakedev3": "fakedev3", "umi-fakedev3": "fakedev3", "fakedev3": "fakedev3"}
export default handler
