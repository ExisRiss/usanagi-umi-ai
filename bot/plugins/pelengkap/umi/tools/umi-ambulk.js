import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ambulk", "category": "tools", "aliasMap": {"umi-tools-ambulk": "ambulk", "umi-ambulk": "ambulk", "umi-amremlist": "amremlist", "umi-bulkam": "bulkam", "umi-ambulkgen": "ambulkgen", "ambulk": "ambulk", "amremlist": "amremlist", "bulkam": "bulkam", "ambulkgen": "ambulkgen"}, "description": "Membuat beberapa akun Alight Motion Premium sekaligus (bulk)", "usage": ".ambulk <jumlah> <prefix>", "example": ".ambulk 3 umi", "cooldown": 15, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ambulk.js", metadata, m, extra)
handler.help = ["umi-tools-ambulk <jumlah> <prefix>"]
handler.command = ["umi-tools-ambulk", "umi-ambulk", "umi-amremlist", "umi-bulkam", "umi-ambulkgen", "ambulk", "amremlist", "bulkam", "ambulkgen"]
handler.tags = ["tools"]
handler.description = "Membuat beberapa akun Alight Motion Premium sekaligus (bulk)"
handler.importSource = "umi"
handler.importConfig = {"name": "ambulk", "alias": ["amremlist", "bulkam", "ambulkgen"], "category": "tools", "description": "Membuat beberapa akun Alight Motion Premium sekaligus (bulk)", "usage": ".ambulk <jumlah> <prefix>", "example": ".ambulk 3 umi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-ambulk": "ambulk", "umi-ambulk": "ambulk", "umi-amremlist": "amremlist", "umi-bulkam": "bulkam", "umi-ambulkgen": "ambulkgen", "ambulk": "ambulk", "amremlist": "amremlist", "bulkam": "bulkam", "ambulkgen": "ambulkgen"}
export default handler
