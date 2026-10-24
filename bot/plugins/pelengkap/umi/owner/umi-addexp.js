import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addexp", "category": "owner", "aliasMap": {"umi-owner-addexp": "addexp", "umi-addexp": "addexp", "umi-tambahexp": "tambahexp", "umi-giveexp": "giveexp", "umi-addxp": "addxp", "tambahexp": "tambahexp", "giveexp": "giveexp", "addxp": "addxp"}, "description": "Tambah exp user (max 9 Miliar)", "usage": ".addexp <jumlah> @user", "example": ".addexp 10000 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addexp.js", metadata, m, extra)
handler.help = ["umi-owner-addexp <jumlah> @user"]
handler.command = ["umi-owner-addexp", "umi-addexp", "umi-tambahexp", "umi-giveexp", "umi-addxp", "tambahexp", "giveexp", "addxp"]
handler.tags = ["owner"]
handler.description = "Tambah exp user (max 9 Miliar)"
handler.importSource = "umi"
handler.importConfig = {"name": "addexp", "alias": ["tambahexp", "giveexp", "addxp"], "category": "owner", "description": "Tambah exp user (max 9 Miliar)", "usage": ".addexp <jumlah> @user", "example": ".addexp 10000 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addexp": "addexp", "umi-addexp": "addexp", "umi-tambahexp": "tambahexp", "umi-giveexp": "giveexp", "umi-addxp": "addxp", "tambahexp": "tambahexp", "giveexp": "giveexp", "addxp": "addxp"}
export default handler
