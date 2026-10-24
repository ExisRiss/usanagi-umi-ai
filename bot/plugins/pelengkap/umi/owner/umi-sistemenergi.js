import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sistemenergi", "category": "owner", "aliasMap": {"umi-owner-sistemenergi": "sistemenergi", "umi-sistemenergi": "sistemenergi", "umi-sistemlimit": "sistemlimit", "umi-energimode": "energimode", "umi-limitmode": "limitmode", "sistemenergi": "sistemenergi", "sistemlimit": "sistemlimit", "energimode": "energimode", "limitmode": "limitmode"}, "description": "Mengecek, menghidupkan, atau mematikan sistem energi secara global", "usage": ".sistemenergi [on / off]", "example": ".sistemenergi on", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/sistemenergi.js", metadata, m, extra)
handler.help = ["umi-owner-sistemenergi [on / off]"]
handler.command = ["umi-owner-sistemenergi", "umi-sistemenergi", "umi-sistemlimit", "umi-energimode", "umi-limitmode", "sistemenergi", "sistemlimit", "energimode", "limitmode"]
handler.tags = ["owner"]
handler.description = "Mengecek, menghidupkan, atau mematikan sistem energi secara global"
handler.importSource = "umi"
handler.importConfig = {"name": "sistemenergi", "alias": ["sistemlimit", "energimode", "limitmode"], "category": "owner", "description": "Mengecek, menghidupkan, atau mematikan sistem energi secara global", "usage": ".sistemenergi [on / off]", "example": ".sistemenergi on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-sistemenergi": "sistemenergi", "umi-sistemenergi": "sistemenergi", "umi-sistemlimit": "sistemlimit", "umi-energimode": "energimode", "umi-limitmode": "limitmode", "sistemenergi": "sistemenergi", "sistemlimit": "sistemlimit", "energimode": "energimode", "limitmode": "limitmode"}
export default handler
