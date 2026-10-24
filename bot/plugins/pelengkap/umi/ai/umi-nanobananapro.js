/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nanobananapro", "category": "ai", "aliasMap": {"umi-ai-nanobananapro": "nanobananapro", "umi-nanobananapro": "nanobananapro", "umi-nanopro": "nanopro", "nanobananapro": "nanobananapro", "nanopro": "nanopro"}, "description": "Edit gambar dengan Nano Banana Pro dari source CANTARELLA", "usage": ".nanobananapro <prompt> (reply gambar)", "example": ".nanobananapro ubah jadi sketsa pensil", "cooldown": 30, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/nanobananapro.js", metadata, m, extra)
handler.help = ["umi-ai-nanobananapro <prompt> (reply gambar)"]
handler.command = ["umi-ai-nanobananapro", "umi-nanobananapro", "umi-nanopro", "nanobananapro", "nanopro"]
handler.tags = ["ai"]
handler.description = "Edit gambar dengan Nano Banana Pro dari source CANTARELLA"
handler.importSource = "umi"
handler.importConfig = {"name": "nanobananapro", "alias": ["nanopro"], "category": "ai", "description": "Edit gambar dengan Nano Banana Pro dari source CANTARELLA", "usage": ".nanobananapro <prompt> (reply gambar)", "example": ".nanobananapro ubah jadi sketsa pensil", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-nanobananapro": "nanobananapro", "umi-nanobananapro": "nanobananapro", "umi-nanopro": "nanopro", "nanobananapro": "nanobananapro", "nanopro": "nanopro"}
export default handler
