import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setrulesgrup", "category": "group", "aliasMap": {"umi-group-setrulesgrup": "setrulesgrup", "umi-setrulesgrup": "setrulesgrup", "umi-setgrouprules": "setgrouprules", "umi-setaturangrup": "setaturangrup", "setrulesgrup": "setrulesgrup", "setgrouprules": "setgrouprules", "setaturangrup": "setaturangrup"}, "description": "Set rules/aturan grup custom (admin only)", "usage": ".setrulesgrup <text>", "example": ".setrulesgrup 1. Jangan spam\n2. Hormati sesama", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/setrulesgrup.js", metadata, m, extra)
handler.help = ["umi-group-setrulesgrup <text>"]
handler.command = ["umi-group-setrulesgrup", "umi-setrulesgrup", "umi-setgrouprules", "umi-setaturangrup", "setrulesgrup", "setgrouprules", "setaturangrup"]
handler.tags = ["group"]
handler.description = "Set rules/aturan grup custom (admin only)"
handler.importSource = "umi"
handler.importConfig = {"name": "setrulesgrup", "alias": ["setgrouprules", "setaturangrup"], "category": "group", "description": "Set rules/aturan grup custom (admin only)", "usage": ".setrulesgrup <text>", "example": ".setrulesgrup 1. Jangan spam\n2. Hormati sesama", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-setrulesgrup": "setrulesgrup", "umi-setrulesgrup": "setrulesgrup", "umi-setgrouprules": "setgrouprules", "umi-setaturangrup": "setaturangrup", "setrulesgrup": "setrulesgrup", "setgrouprules": "setgrouprules", "setaturangrup": "setaturangrup"}
export default handler
