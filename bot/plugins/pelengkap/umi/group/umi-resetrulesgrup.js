import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetrulesgrup", "category": "group", "aliasMap": {"umi-group-resetrulesgrup": "resetrulesgrup", "umi-resetrulesgrup": "resetrulesgrup", "umi-resetgrouprules": "resetgrouprules", "resetrulesgrup": "resetrulesgrup", "resetgrouprules": "resetgrouprules"}, "description": "Reset rules grup ke default (admin only)", "usage": ".resetrulesgrup", "example": ".resetrulesgrup", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/resetrulesgrup.js", metadata, m, extra)
handler.help = ["umi-group-resetrulesgrup"]
handler.command = ["umi-group-resetrulesgrup", "umi-resetrulesgrup", "umi-resetgrouprules", "resetrulesgrup", "resetgrouprules"]
handler.tags = ["group"]
handler.description = "Reset rules grup ke default (admin only)"
handler.importSource = "umi"
handler.importConfig = {"name": "resetrulesgrup", "alias": ["resetgrouprules"], "category": "group", "description": "Reset rules grup ke default (admin only)", "usage": ".resetrulesgrup", "example": ".resetrulesgrup", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-resetrulesgrup": "resetrulesgrup", "umi-resetrulesgrup": "resetrulesgrup", "umi-resetgrouprules": "resetgrouprules", "resetrulesgrup": "resetrulesgrup", "resetgrouprules": "resetgrouprules"}
export default handler
