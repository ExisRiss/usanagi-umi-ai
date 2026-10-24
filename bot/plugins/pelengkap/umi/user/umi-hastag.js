/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hastag", "category": "user", "aliasMap": {"umi-user-hastag": "hastag", "umi-hastag": "hastag", "umi-sethastag": "sethastag", "umi-formathastag": "formathastag", "hastag": "hastag", "sethastag": "sethastag", "formathastag": "formathastag"}, "description": "Menampilkan template hastag KGR dengan tombol copy otomatis", "usage": ".hastag", "example": ".hastag", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/hastag.js", metadata, m, extra)
handler.help = ["umi-user-hastag"]
handler.command = ["umi-user-hastag", "umi-hastag", "umi-sethastag", "umi-formathastag", "hastag", "sethastag", "formathastag"]
handler.tags = ["user"]
handler.description = "Menampilkan template hastag KGR dengan tombol copy otomatis"
handler.importSource = "umi"
handler.importConfig = {"name": "hastag", "alias": ["hastag", "sethastag", "formathastag"], "category": "user", "description": "Menampilkan template hastag KGR dengan tombol copy otomatis", "usage": ".hastag", "example": ".hastag", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-hastag": "hastag", "umi-hastag": "hastag", "umi-sethastag": "sethastag", "umi-formathastag": "formathastag", "hastag": "hastag", "sethastag": "sethastag", "formathastag": "formathastag"}
export default handler
