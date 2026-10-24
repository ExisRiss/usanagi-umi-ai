import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "npmstalk", "category": "stalker", "aliasMap": {"umi-stalker-npmstalk": "npmstalk", "umi-npmstalk": "npmstalk", "umi-stalknpm": "stalknpm", "umi-npms": "npms", "npmstalk": "npmstalk", "stalknpm": "stalknpm", "npms": "npms"}, "description": "Stalk akun NPM (Node Package Manager)", "usage": ".npmstalk <username>", "example": ".npmstalk hanya_zann", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/npmstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-npmstalk <username>"]
handler.command = ["umi-stalker-npmstalk", "umi-npmstalk", "umi-stalknpm", "umi-npms", "npmstalk", "stalknpm", "npms"]
handler.tags = ["stalker"]
handler.description = "Stalk akun NPM (Node Package Manager)"
handler.importSource = "umi"
handler.importConfig = {"name": "npmstalk", "alias": ["stalknpm", "npms"], "category": "stalker", "description": "Stalk akun NPM (Node Package Manager)", "usage": ".npmstalk <username>", "example": ".npmstalk hanya_zann", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-npmstalk": "npmstalk", "umi-npmstalk": "npmstalk", "umi-stalknpm": "stalknpm", "umi-npms": "npms", "npmstalk": "npmstalk", "stalknpm": "stalknpm", "npms": "npms"}
export default handler
