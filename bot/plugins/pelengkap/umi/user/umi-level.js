/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "level", "category": "user", "aliasMap": {"umi-user-level": "level", "umi-level": "level", "umi-lvl": "lvl", "umi-ceklevel": "ceklevel", "level": "level", "lvl": "lvl", "ceklevel": "ceklevel"}, "description": "Cek level user", "usage": ".level [@user]", "example": ".level", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/level.js", metadata, m, extra)
handler.help = ["umi-user-level [@user]"]
handler.command = ["umi-user-level", "umi-level", "umi-lvl", "umi-ceklevel", "level", "lvl", "ceklevel"]
handler.tags = ["user"]
handler.description = "Cek level user"
handler.importSource = "umi"
handler.importConfig = {"name": "level", "alias": ["lvl", "ceklevel"], "category": "user", "description": "Cek level user", "usage": ".level [@user]", "example": ".level", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-level": "level", "umi-level": "level", "umi-lvl": "lvl", "umi-ceklevel": "ceklevel", "level": "level", "lvl": "lvl", "ceklevel": "ceklevel"}
export default handler
