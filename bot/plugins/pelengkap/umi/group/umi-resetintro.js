/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetintro", "category": "group", "aliasMap": {"umi-group-resetintro": "resetintro", "umi-resetintro": "resetintro", "umi-introdel": "introdel", "umi-delintro": "delintro", "umi-deleteintro": "deleteintro", "resetintro": "resetintro", "introdel": "introdel", "deleteintro": "deleteintro"}, "description": "Reset intro grup ke default (admin only)", "usage": ".resetintro", "example": ".resetintro", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/resetintro.js", metadata, m, extra)
handler.help = ["umi-group-resetintro"]
handler.command = ["umi-group-resetintro", "umi-resetintro", "umi-introdel", "umi-delintro", "umi-deleteintro", "resetintro", "introdel", "deleteintro"]
handler.tags = ["group"]
handler.description = "Reset intro grup ke default (admin only)"
handler.importSource = "umi"
handler.importConfig = {"name": "resetintro", "alias": ["introdel", "delintro", "deleteintro"], "category": "group", "description": "Reset intro grup ke default (admin only)", "usage": ".resetintro", "example": ".resetintro", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-resetintro": "resetintro", "umi-resetintro": "resetintro", "umi-introdel": "introdel", "umi-delintro": "delintro", "umi-deleteintro": "deleteintro", "resetintro": "resetintro", "introdel": "introdel", "deleteintro": "deleteintro"}
export default handler
