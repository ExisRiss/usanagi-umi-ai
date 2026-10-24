import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "githubstalk", "category": "stalker", "aliasMap": {"umi-stalker-githubstalk": "githubstalk", "umi-githubstalk": "githubstalk", "umi-ghstalk": "ghstalk", "umi-stalkgh": "stalkgh", "githubstalk": "githubstalk", "ghstalk": "ghstalk", "stalkgh": "stalkgh"}, "description": "Stalk akun GitHub", "usage": ".githubstalk <username>", "example": ".githubstalk torvalds", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/githubstalk.js", metadata, m, extra)
handler.help = ["umi-stalker-githubstalk <username>"]
handler.command = ["umi-stalker-githubstalk", "umi-githubstalk", "umi-ghstalk", "umi-stalkgh", "githubstalk", "ghstalk", "stalkgh"]
handler.tags = ["stalker"]
handler.description = "Stalk akun GitHub"
handler.importSource = "umi"
handler.importConfig = {"name": "githubstalk", "alias": ["ghstalk", "stalkgh"], "category": "stalker", "description": "Stalk akun GitHub", "usage": ".githubstalk <username>", "example": ".githubstalk torvalds", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-githubstalk": "githubstalk", "umi-githubstalk": "githubstalk", "umi-ghstalk": "ghstalk", "umi-stalkgh": "stalkgh", "githubstalk": "githubstalk", "ghstalk": "ghstalk", "stalkgh": "stalkgh"}
export default handler
