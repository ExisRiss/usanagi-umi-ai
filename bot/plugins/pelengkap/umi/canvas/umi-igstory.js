/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "igstory", "category": "canvas", "aliasMap": {"umi-canvas-igstory": "igstory", "umi-igstorypost": "igstorypost", "igstorypost": "igstorypost"}, "description": "Membuat gambar simulasi post Instagram Story dari foto profil dan gambarmu.", "usage": ".igstory [kirim/reply gambar]", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/igstory.js", metadata, m, extra)
handler.help = ["umi-canvas-igstory [kirim/reply gambar]"]
handler.command = ["umi-canvas-igstory", "umi-igstorypost", "igstorypost"]
handler.tags = ["canvas"]
handler.description = "Membuat gambar simulasi post Instagram Story dari foto profil dan gambarmu."
handler.importSource = "umi"
handler.importConfig = {"name": "igstory", "alias": ["igstorypost"], "category": "canvas", "description": "Membuat gambar simulasi post Instagram Story dari foto profil dan gambarmu.", "usage": ".igstory [kirim/reply gambar]", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-igstory": "igstory", "umi-igstorypost": "igstorypost", "igstorypost": "igstorypost"}
export default handler
