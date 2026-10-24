import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setgoodbyetype", "category": "owner", "aliasMap": {"umi-owner-setgoodbyetype": "setgoodbyetype", "umi-setgoodbyetype": "setgoodbyetype", "umi-goodbyetype": "goodbyetype", "umi-goodbyevariant": "goodbyevariant", "umi-goodbyestyle": "goodbyestyle", "setgoodbyetype": "setgoodbyetype", "goodbyetype": "goodbyetype", "goodbyevariant": "goodbyevariant", "goodbyestyle": "goodbyestyle"}, "description": "Mengatur variant tampilan goodbye message", "usage": ".setgoodbyetype", "example": ".setgoodbyetype", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setgoodbyetype.js", metadata, m, extra)
handler.help = ["umi-owner-setgoodbyetype"]
handler.command = ["umi-owner-setgoodbyetype", "umi-setgoodbyetype", "umi-goodbyetype", "umi-goodbyevariant", "umi-goodbyestyle", "setgoodbyetype", "goodbyetype", "goodbyevariant", "goodbyestyle"]
handler.tags = ["owner"]
handler.description = "Mengatur variant tampilan goodbye message"
handler.importSource = "umi"
handler.importConfig = {"name": "setgoodbyetype", "alias": ["goodbyetype", "goodbyevariant", "goodbyestyle"], "category": "owner", "description": "Mengatur variant tampilan goodbye message", "usage": ".setgoodbyetype", "example": ".setgoodbyetype", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setgoodbyetype": "setgoodbyetype", "umi-setgoodbyetype": "setgoodbyetype", "umi-goodbyetype": "goodbyetype", "umi-goodbyevariant": "goodbyevariant", "umi-goodbyestyle": "goodbyestyle", "setgoodbyetype": "setgoodbyetype", "goodbyetype": "goodbyetype", "goodbyevariant": "goodbyevariant", "goodbyestyle": "goodbyestyle"}
export default handler
