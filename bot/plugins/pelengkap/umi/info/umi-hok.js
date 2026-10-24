import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hok", "category": "info", "aliasMap": {"umi-info-hok": "hok", "umi-hok": "hok", "umi-hokinfo": "hokinfo", "umi-honorofkings": "honorofkings", "hok": "hok", "hokinfo": "hokinfo", "honorofkings": "honorofkings"}, "description": "Informasi karakter Honor of Kings", "usage": ".hok <nama karakter>", "example": ".hok Dyadia", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/hok.js", metadata, m, extra)
handler.help = ["umi-info-hok <nama karakter>"]
handler.command = ["umi-info-hok", "umi-hok", "umi-hokinfo", "umi-honorofkings", "hok", "hokinfo", "honorofkings"]
handler.tags = ["info"]
handler.description = "Informasi karakter Honor of Kings"
handler.importSource = "umi"
handler.importConfig = {"name": "hok", "alias": ["hokinfo", "honorofkings"], "category": "info", "description": "Informasi karakter Honor of Kings", "usage": ".hok <nama karakter>", "example": ".hok Dyadia", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-hok": "hok", "umi-hok": "hok", "umi-hokinfo": "hokinfo", "umi-honorofkings": "honorofkings", "hok": "hok", "hokinfo": "hokinfo", "honorofkings": "honorofkings"}
export default handler
