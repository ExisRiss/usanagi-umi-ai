/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delexp", "category": "owner", "aliasMap": {"umi-owner-delexp": "delexp", "umi-delexp": "delexp", "umi-kurangexp": "kurangexp", "umi-removeexp": "removeexp", "umi-delxp": "delxp", "delexp": "delexp", "kurangexp": "kurangexp", "removeexp": "removeexp", "delxp": "delxp"}, "description": "Kurangi exp user", "usage": ".delexp <jumlah> @user", "example": ".delexp 5000 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/delexp.js", metadata, m, extra)
handler.help = ["umi-owner-delexp <jumlah> @user"]
handler.command = ["umi-owner-delexp", "umi-delexp", "umi-kurangexp", "umi-removeexp", "umi-delxp", "delexp", "kurangexp", "removeexp", "delxp"]
handler.tags = ["owner"]
handler.description = "Kurangi exp user"
handler.importSource = "umi"
handler.importConfig = {"name": "delexp", "alias": ["kurangexp", "removeexp", "delxp"], "category": "owner", "description": "Kurangi exp user", "usage": ".delexp <jumlah> @user", "example": ".delexp 5000 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-delexp": "delexp", "umi-delexp": "delexp", "umi-kurangexp": "kurangexp", "umi-removeexp": "removeexp", "umi-delxp": "delxp", "delexp": "delexp", "kurangexp": "kurangexp", "removeexp": "removeexp", "delxp": "delxp"}
export default handler
