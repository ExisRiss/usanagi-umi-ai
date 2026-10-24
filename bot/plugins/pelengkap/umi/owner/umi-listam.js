import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listam", "category": "owner", "aliasMap": {"umi-owner-listam": "listam", "umi-listam": "listam", "umi-amlist": "amlist", "umi-listroleam": "listroleam", "listam": "listam", "amlist": "amlist", "listroleam": "listroleam"}, "description": "List user role Alight Motion", "usage": ".listam [role]", "example": ".listam partner", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/listam.js", metadata, m, extra)
handler.help = ["umi-owner-listam [role]"]
handler.command = ["umi-owner-listam", "umi-listam", "umi-amlist", "umi-listroleam", "listam", "amlist", "listroleam"]
handler.tags = ["owner"]
handler.description = "List user role Alight Motion"
handler.importSource = "umi"
handler.importConfig = {"name": "listam", "alias": ["amlist", "listroleam"], "category": "owner", "description": "List user role Alight Motion", "usage": ".listam [role]", "example": ".listam partner", "isOwner": false, "isPremium": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-listam": "listam", "umi-listam": "listam", "umi-amlist": "amlist", "umi-listroleam": "listroleam", "listam": "listam", "amlist": "amlist", "listroleam": "listroleam"}
export default handler
