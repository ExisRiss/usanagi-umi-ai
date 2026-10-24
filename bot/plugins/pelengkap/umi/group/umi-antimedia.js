/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antimedia", "category": "group", "aliasMap": {"umi-group-antimedia": "antimedia", "umi-antimedia": "antimedia", "umi-nomedia": "nomedia", "antimedia": "antimedia", "am": "am", "nomedia": "nomedia"}, "description": "Mengatur antimedia di grup (blokir gambar/video/audio/dokumen)", "usage": ".antimedia <on/off>", "example": ".antimedia on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antimedia.js", metadata, m, extra)
handler.help = ["umi-group-antimedia <on/off>"]
handler.command = ["umi-group-antimedia", "umi-antimedia", "umi-nomedia", "antimedia", "am", "nomedia"]
handler.tags = ["group"]
handler.description = "Mengatur antimedia di grup (blokir gambar/video/audio/dokumen)"
handler.importSource = "umi"
handler.importConfig = {"name": "antimedia", "alias": ["am", "nomedia"], "category": "group", "description": "Mengatur antimedia di grup (blokir gambar/video/audio/dokumen)", "usage": ".antimedia <on/off>", "example": ".antimedia on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antimedia": "antimedia", "umi-antimedia": "antimedia", "umi-nomedia": "nomedia", "antimedia": "antimedia", "am": "am", "nomedia": "nomedia"}
export default handler
