/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "energi", "category": "user", "aliasMap": {"umi-user-energi": "energi", "umi-energi": "energi", "umi-cekenergi": "cekenergi", "umi-myenergi": "myenergi", "umi-limit": "limit", "umi-ceklimit": "ceklimit", "energi": "energi", "cekenergi": "cekenergi", "myenergi": "myenergi", "ceklimit": "ceklimit"}, "description": "Cek energi user", "usage": ".energi [@user]", "example": ".energi", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/energi.js", metadata, m, extra)
handler.help = ["umi-user-energi [@user]"]
handler.command = ["umi-user-energi", "umi-energi", "umi-cekenergi", "umi-myenergi", "umi-limit", "umi-ceklimit", "energi", "cekenergi", "myenergi", "ceklimit"]
handler.tags = ["user"]
handler.description = "Cek energi user"
handler.importSource = "umi"
handler.importConfig = {"name": "energi", "alias": ["cekenergi", "myenergi", "energy", "limit", "ceklimit"], "category": "user", "description": "Cek energi user", "usage": ".energi [@user]", "example": ".energi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-energi": "energi", "umi-energi": "energi", "umi-cekenergi": "cekenergi", "umi-myenergi": "myenergi", "umi-limit": "limit", "umi-ceklimit": "ceklimit", "energi": "energi", "cekenergi": "cekenergi", "myenergi": "myenergi", "ceklimit": "ceklimit"}
export default handler
