import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "koin", "category": "user", "aliasMap": {"umi-user-koin": "koin", "umi-koin": "koin", "umi-saldo": "saldo", "umi-money": "money", "umi-cash": "cash", "umi-coin": "coin", "umi-coins": "coins", "koin": "koin", "saldo": "saldo", "money": "money", "cash": "cash", "coin": "coin", "coins": "coins"}, "description": "Cek koin user", "usage": ".koin [@user]", "example": ".koin", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/koin.js", metadata, m, extra)
handler.help = ["umi-user-koin [@user]"]
handler.command = ["umi-user-koin", "umi-koin", "umi-saldo", "umi-money", "umi-cash", "umi-coin", "umi-coins", "koin", "saldo", "money", "cash", "coin", "coins"]
handler.tags = ["user"]
handler.description = "Cek koin user"
handler.importSource = "umi"
handler.importConfig = {"name": "koin", "alias": ["saldo", "money", "cash", "coin", "coins"], "category": "user", "description": "Cek koin user", "usage": ".koin [@user]", "example": ".koin", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-koin": "koin", "umi-koin": "koin", "umi-saldo": "saldo", "umi-money": "money", "umi-cash": "cash", "umi-coin": "coin", "umi-coins": "coins", "koin": "koin", "saldo": "saldo", "money": "money", "cash": "cash", "coin": "coin", "coins": "coins"}
export default handler
