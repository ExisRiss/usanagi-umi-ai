import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fakedev", "category": "canvas", "aliasMap": {"umi-canvas-fakedev": "fakedev", "umi-fakedev": "fakedev", "fakedev": "fakedev"}, "description": "Bikin gambar fakedev dari fotomu", "usage": ".fakedev <teks> (reply/kirim foto)", "example": ".fakedev developer", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/fakedev.js", metadata, m, extra)
handler.help = ["umi-canvas-fakedev <teks> (reply/kirim foto)"]
handler.command = ["umi-canvas-fakedev", "umi-fakedev", "fakedev"]
handler.tags = ["canvas"]
handler.description = "Bikin gambar fakedev dari fotomu"
handler.importSource = "umi"
handler.importConfig = {"name": "fakedev", "alias": [], "category": "canvas", "description": "Bikin gambar fakedev dari fotomu", "usage": ".fakedev <teks> (reply/kirim foto)", "example": ".fakedev developer", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-fakedev": "fakedev", "umi-fakedev": "fakedev", "fakedev": "fakedev"}
export default handler
