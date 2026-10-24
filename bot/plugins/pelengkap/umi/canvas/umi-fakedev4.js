/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakedev4", "category": "canvas", "aliasMap": {"umi-canvas-fakedev4": "fakedev4", "umi-fakedev4": "fakedev4", "fakedev4": "fakedev4"}, "description": "Bikin gambar fakedev 4 dari fotomu", "usage": ".fakedev4 <teks> (reply/kirim foto)", "example": ".fakedev4 developer", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakedev4.js", metadata, m, extra)
handler.help = ["umi-canvas-fakedev4 <teks> (reply/kirim foto)"]
handler.command = ["umi-canvas-fakedev4", "umi-fakedev4", "fakedev4"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar fakedev 4 dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "fakedev4", "alias": [], "category": "canvas", "description": "Bikin gambar fakedev 4 dari fotomu", "usage": ".fakedev4 <teks> (reply/kirim foto)", "example": ".fakedev4 developer", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakedev4": "fakedev4", "umi-fakedev4": "fakedev4", "fakedev4": "fakedev4"}
export default handler
