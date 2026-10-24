import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bank", "category": "rpg", "aliasMap": {"umi-rpg-bank": "bank", "umi-bank": "bank", "umi-atm": "atm", "umi-nabung": "nabung", "umi-deposit": "deposit", "umi-tarik": "tarik", "umi-withdraw": "withdraw", "nabung": "nabung", "tarik": "tarik"}, "description": "Bank system untuk menyimpan uang aman dari rampok", "usage": ".bank <deposit/withdraw> <jumlah>", "example": ".bank deposit 10000", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/bank.js", metadata, m, extra)
handler.help = ["umi-rpg-bank <deposit/withdraw> <jumlah>"]
handler.command = ["umi-rpg-bank", "umi-bank", "umi-atm", "umi-nabung", "umi-deposit", "umi-tarik", "umi-withdraw", "nabung", "tarik"]
handler.tags = ["rpg"]
handler.description = "Bank system untuk menyimpan uang aman dari rampok"
handler.importSource = "umi"
handler.importConfig = {"name": "bank", "alias": ["atm", "nabung", "deposit", "tarik", "withdraw"], "category": "rpg", "description": "Bank system untuk menyimpan uang aman dari rampok", "usage": ".bank <deposit/withdraw> <jumlah>", "example": ".bank deposit 10000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-bank": "bank", "umi-bank": "bank", "umi-atm": "atm", "umi-nabung": "nabung", "umi-deposit": "deposit", "umi-tarik": "tarik", "umi-withdraw": "withdraw", "nabung": "nabung", "tarik": "tarik"}
export default handler
