import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetrules", "category": "owner", "aliasMap": {"umi-owner-resetrules": "resetrules", "umi-resetrules": "resetrules", "umi-resetbotrules": "resetbotrules", "resetrules": "resetrules", "resetbotrules": "resetbotrules"}, "description": "Reset rules bot ke default", "usage": ".resetrules", "example": ".resetrules", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/resetrules.js", metadata, m, extra)
handler.help = ["umi-owner-resetrules"]
handler.command = ["umi-owner-resetrules", "umi-resetrules", "umi-resetbotrules", "resetrules", "resetbotrules"]
handler.tags = ["owner"]
handler.description = "Reset rules bot ke default"
handler.importSource = "umi"
handler.importConfig = {"name": "resetrules", "alias": ["resetbotrules"], "category": "owner", "description": "Reset rules bot ke default", "usage": ".resetrules", "example": ".resetrules", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-resetrules": "resetrules", "umi-resetrules": "resetrules", "umi-resetbotrules": "resetbotrules", "resetrules": "resetrules", "resetbotrules": "resetbotrules"}
export default handler
