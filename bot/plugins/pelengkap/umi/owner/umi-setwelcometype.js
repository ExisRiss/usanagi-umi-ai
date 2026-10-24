import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setwelcometype", "category": "owner", "aliasMap": {"umi-owner-setwelcometype": "setwelcometype", "umi-setwelcometype": "setwelcometype", "umi-welcometype": "welcometype", "umi-welcomevariant": "welcomevariant", "umi-welcomestyle": "welcomestyle", "setwelcometype": "setwelcometype", "welcometype": "welcometype", "welcomevariant": "welcomevariant", "welcomestyle": "welcomestyle"}, "description": "Mengatur variant tampilan welcome message", "usage": ".setwelcometype", "example": ".setwelcometype", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setwelcometype.js", metadata, m, extra)
handler.help = ["umi-owner-setwelcometype"]
handler.command = ["umi-owner-setwelcometype", "umi-setwelcometype", "umi-welcometype", "umi-welcomevariant", "umi-welcomestyle", "setwelcometype", "welcometype", "welcomevariant", "welcomestyle"]
handler.tags = ["owner"]
handler.description = "Mengatur variant tampilan welcome message"
handler.importSource = "umi"
handler.importConfig = {"name": "setwelcometype", "alias": ["welcometype", "welcomevariant", "welcomestyle"], "category": "owner", "description": "Mengatur variant tampilan welcome message", "usage": ".setwelcometype", "example": ".setwelcometype", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setwelcometype": "setwelcometype", "umi-setwelcometype": "setwelcometype", "umi-welcometype": "welcometype", "umi-welcomevariant": "welcomevariant", "umi-welcomestyle": "welcomestyle", "setwelcometype": "setwelcometype", "welcometype": "welcometype", "welcomevariant": "welcomevariant", "welcomestyle": "welcomestyle"}
export default handler
