/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "saluran", "category": "main", "aliasMap": {"umi-main-saluran": "saluran", "umi-saluran": "saluran", "umi-channel": "channel", "umi-ch": "ch", "umi-joinch": "joinch", "saluran": "saluran", "channel": "channel", "ch": "ch", "joinch": "joinch"}, "description": "Join saluran resmi Umi 😈", "usage": ".saluran", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/saluranbot.js", metadata, m, extra)
handler.help = ["umi-main-saluran"]
handler.command = ["umi-main-saluran", "umi-saluran", "umi-channel", "umi-ch", "umi-joinch", "saluran", "channel", "ch", "joinch"]
handler.tags = ["main"]
handler.description = "Join saluran resmi Umi 😈"
handler.importSource = "umi"
handler.importConfig = {"name": "saluran", "alias": ["channel", "ch", "joinch"], "category": "main", "description": "Join saluran resmi Umi 😈", "usage": ".saluran", "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-saluran": "saluran", "umi-saluran": "saluran", "umi-channel": "channel", "umi-ch": "ch", "umi-joinch": "joinch", "saluran": "saluran", "channel": "channel", "ch": "ch", "joinch": "joinch"}
export default handler
