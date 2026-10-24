/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "leave", "category": "owner", "aliasMap": {"umi-owner-leave": "leave", "umi-leave": "leave", "umi-leavegrup": "leavegrup", "umi-leavegroup": "leavegroup", "umi-keluar": "keluar", "umi-bye": "bye", "leave": "leave", "leavegrup": "leavegrup", "leavegroup": "leavegroup", "keluar": "keluar"}, "description": "Bot keluar dari grup", "usage": ".leave [link]", "example": ".leave", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/leave.js", metadata, m, extra)
handler.help = ["umi-owner-leave [link]"]
handler.command = ["umi-owner-leave", "umi-leave", "umi-leavegrup", "umi-leavegroup", "umi-keluar", "umi-bye", "leave", "leavegrup", "leavegroup", "keluar"]
handler.tags = ["owner"]
handler.description = "Bot keluar dari grup"
handler.importSource = "umi"
handler.importConfig = {"name": "leave", "alias": ["leavegrup", "leavegroup", "keluar", "bye"], "category": "owner", "description": "Bot keluar dari grup", "usage": ".leave [link]", "example": ".leave", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-leave": "leave", "umi-leave": "leave", "umi-leavegrup": "leavegrup", "umi-leavegroup": "leavegroup", "umi-keluar": "keluar", "umi-bye": "bye", "leave": "leave", "leavegrup": "leavegrup", "leavegroup": "leavegroup", "keluar": "keluar"}
export default handler
