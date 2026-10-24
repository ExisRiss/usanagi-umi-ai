import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delkoin", "category": "owner", "aliasMap": {"umi-owner-delkoin": "delkoin", "umi-delkoin": "delkoin", "umi-kurangkoin": "kurangkoin", "umi-removekoin": "removekoin", "umi-delcoin": "delcoin", "umi-delmoney": "delmoney", "delkoin": "delkoin", "kurangkoin": "kurangkoin", "removekoin": "removekoin", "delcoin": "delcoin", "delmoney": "delmoney"}, "description": "Kurangi koin user", "usage": ".delkoin <jumlah> @user", "example": ".delkoin 50000 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/delkoin.js", metadata, m, extra)
handler.help = ["umi-owner-delkoin <jumlah> @user"]
handler.command = ["umi-owner-delkoin", "umi-delkoin", "umi-kurangkoin", "umi-removekoin", "umi-delcoin", "umi-delmoney", "delkoin", "kurangkoin", "removekoin", "delcoin", "delmoney"]
handler.tags = ["owner"]
handler.description = "Kurangi koin user"
handler.importSource = "umi"
handler.importConfig = {"name": "delkoin", "alias": ["kurangkoin", "removekoin", "delcoin", "delmoney"], "category": "owner", "description": "Kurangi koin user", "usage": ".delkoin <jumlah> @user", "example": ".delkoin 50000 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-delkoin": "delkoin", "umi-delkoin": "delkoin", "umi-kurangkoin": "kurangkoin", "umi-removekoin": "removekoin", "umi-delcoin": "delcoin", "umi-delmoney": "delmoney", "delkoin": "delkoin", "kurangkoin": "kurangkoin", "removekoin": "removekoin", "delcoin": "delcoin", "delmoney": "delmoney"}
export default handler
