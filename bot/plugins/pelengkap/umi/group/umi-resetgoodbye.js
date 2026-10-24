import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetgoodbye", "category": "group", "aliasMap": {"umi-group-resetgoodbye": "resetgoodbye", "umi-resetgoodbye": "resetgoodbye", "umi-delgoodbye": "delgoodbye", "umi-cleargoodbye": "cleargoodbye", "delgoodbye": "delgoodbye", "cleargoodbye": "cleargoodbye"}, "description": "Reset goodbye message ke default", "usage": ".resetgoodbye", "example": ".resetgoodbye", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/resetgoodbye.js", metadata, m, extra)
handler.help = ["umi-group-resetgoodbye"]
handler.command = ["umi-group-resetgoodbye", "umi-resetgoodbye", "umi-delgoodbye", "umi-cleargoodbye", "delgoodbye", "cleargoodbye"]
handler.tags = ["group"]
handler.description = "Reset goodbye message ke default"
handler.importSource = "umi"
handler.importConfig = {"name": "resetgoodbye", "alias": ["delgoodbye", "cleargoodbye"], "category": "group", "description": "Reset goodbye message ke default", "usage": ".resetgoodbye", "example": ".resetgoodbye", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-resetgoodbye": "resetgoodbye", "umi-resetgoodbye": "resetgoodbye", "umi-delgoodbye": "delgoodbye", "umi-cleargoodbye": "cleargoodbye", "delgoodbye": "delgoodbye", "cleargoodbye": "cleargoodbye"}
export default handler
