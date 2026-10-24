import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanxp", "category": "clan", "aliasMap": {"umi-clan-clanxp": "clanxp", "umi-clanxp": "clanxp", "umi-xpclan": "xpclan", "umi-clanexp": "clanexp", "clanxp": "clanxp", "xpclan": "xpclan", "clanexp": "clanexp"}, "description": "Lihat XP clan dan kontribusi member", "usage": ".clanxp", "example": ".clanxp", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanxp.js", metadata, m, extra)
handler.help = ["umi-clan-clanxp"]
handler.command = ["umi-clan-clanxp", "umi-clanxp", "umi-xpclan", "umi-clanexp", "clanxp", "xpclan", "clanexp"]
handler.tags = ["clan"]
handler.description = "Lihat XP clan dan kontribusi member"
handler.importSource = "umi"
handler.importConfig = {"name": "clanxp", "alias": ["xpclan", "clanexp"], "category": "clan", "description": "Lihat XP clan dan kontribusi member", "usage": ".clanxp", "example": ".clanxp", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanxp": "clanxp", "umi-clanxp": "clanxp", "umi-xpclan": "xpclan", "umi-clanexp": "clanexp", "clanxp": "clanxp", "xpclan": "xpclan", "clanexp": "clanexp"}
export default handler
