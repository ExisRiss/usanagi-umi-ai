import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addkoin", "category": "owner", "aliasMap": {"umi-owner-addkoin": "addkoin", "umi-addkoin": "addkoin", "umi-tambahkoin": "tambahkoin", "umi-givekoin": "givekoin", "umi-addcoin": "addcoin", "umi-adddcoin": "adddcoin", "addkoin": "addkoin", "tambahkoin": "tambahkoin", "givekoin": "givekoin", "addcoin": "addcoin", "adddcoin": "adddcoin"}, "description": "Tambah koin user (max 9 Triliun)", "usage": ".addkoin <jumlah> @user", "example": ".addkoin 100000 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addkoin.js", metadata, m, extra)
handler.help = ["umi-owner-addkoin <jumlah> @user"]
handler.command = ["umi-owner-addkoin", "umi-addkoin", "umi-tambahkoin", "umi-givekoin", "umi-addcoin", "umi-adddcoin", "addkoin", "tambahkoin", "givekoin", "addcoin", "adddcoin"]
handler.tags = ["owner"]
handler.description = "Tambah koin user (max 9 Triliun)"
handler.importSource = "umi"
handler.importConfig = {"name": "addkoin", "alias": ["tambahkoin", "givekoin", "addcoin", "adddcoin"], "category": "owner", "description": "Tambah koin user (max 9 Triliun)", "usage": ".addkoin <jumlah> @user", "example": ".addkoin 100000 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addkoin": "addkoin", "umi-addkoin": "addkoin", "umi-tambahkoin": "tambahkoin", "umi-givekoin": "givekoin", "umi-addcoin": "addcoin", "umi-adddcoin": "adddcoin", "addkoin": "addkoin", "tambahkoin": "tambahkoin", "givekoin": "givekoin", "addcoin": "addcoin", "adddcoin": "adddcoin"}
export default handler
