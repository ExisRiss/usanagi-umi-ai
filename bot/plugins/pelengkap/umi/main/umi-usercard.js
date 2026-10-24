/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "usercard", "category": "main", "aliasMap": {"umi-main-usercard": "usercard", "umi-usercard": "usercard", "umi-kartu": "kartu", "umi-mycard": "mycard", "usercard": "usercard", "kartu": "kartu", "mycard": "mycard"}, "description": "Menampilkan kartu profil pengguna", "usage": ".usercard [reply/tag]", "example": ".usercard", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/usercard.js", metadata, m, extra)
handler.help = ["umi-main-usercard [reply/tag]"]
handler.command = ["umi-main-usercard", "umi-usercard", "umi-kartu", "umi-mycard", "usercard", "kartu", "mycard"]
handler.tags = ["main"]
handler.description = "Menampilkan kartu profil pengguna"
handler.importSource = "umi"
handler.importConfig = {"name": "usercard", "alias": ["kartu", "mycard"], "category": "main", "description": "Menampilkan kartu profil pengguna", "usage": ".usercard [reply/tag]", "example": ".usercard", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-usercard": "usercard", "umi-usercard": "usercard", "umi-kartu": "kartu", "umi-mycard": "mycard", "usercard": "usercard", "kartu": "kartu", "mycard": "mycard"}
export default handler
