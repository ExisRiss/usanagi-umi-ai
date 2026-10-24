/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setbirthday", "category": "user", "aliasMap": {"umi-user-setbirthday": "setbirthday", "umi-setbirthday": "setbirthday", "umi-setbday": "setbday", "umi-setultah": "setultah", "umi-settgl": "settgl", "setbday": "setbday", "settgl": "settgl"}, "description": "Set tanggal ulang tahun", "usage": ".setbirthday <DD-MM>", "example": ".setbirthday 25-12", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/setbirthday.js", metadata, m, extra)
handler.help = ["umi-user-setbirthday <DD-MM>"]
handler.command = ["umi-user-setbirthday", "umi-setbirthday", "umi-setbday", "umi-setultah", "umi-settgl", "setbday", "settgl"]
handler.tags = ["user"]
handler.description = "Set tanggal ulang tahun"
handler.importSource = "umi"
handler.importConfig = {"name": "setbirthday", "alias": ["setbday", "setultah", "settgl"], "category": "user", "description": "Set tanggal ulang tahun", "usage": ".setbirthday <DD-MM>", "example": ".setbirthday 25-12", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-setbirthday": "setbirthday", "umi-setbirthday": "setbirthday", "umi-setbday": "setbday", "umi-setultah": "setultah", "umi-settgl": "settgl", "setbday": "setbday", "settgl": "settgl"}
export default handler
