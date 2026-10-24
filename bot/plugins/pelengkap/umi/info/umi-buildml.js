import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "buildml", "category": "info", "aliasMap": {"umi-info-buildml": "buildml", "umi-buildml": "buildml", "buildml": "buildml"}, "description": "Build hero Mobile Legends", "usage": ".buildml <hero>", "example": ".buildml gusion", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/buildml.js", metadata, m, extra)
handler.help = ["umi-info-buildml <hero>"]
handler.command = ["umi-info-buildml", "umi-buildml", "buildml"]
handler.tags = ["info"]
handler.description = "Build hero Mobile Legends"
handler.importSource = "umi"
handler.importConfig = {"name": "buildml", "alias": [], "category": "info", "description": "Build hero Mobile Legends", "usage": ".buildml <hero>", "example": ".buildml gusion", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-buildml": "buildml", "umi-buildml": "buildml", "buildml": "buildml"}
export default handler
