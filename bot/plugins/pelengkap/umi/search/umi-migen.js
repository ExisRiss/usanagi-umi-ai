import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "meigen", "category": "search", "aliasMap": {"umi-search-meigen": "meigen", "umi-meigen": "meigen", "umi-meigens": "meigens", "meigen": "meigen", "meigens": "meigens"}, "description": "Cari prompt dari Meigen AI", "usage": ".meigen <query>", "example": ".meigen anime girl", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/migen.js", metadata, m, extra)
handler.help = ["umi-search-meigen <query>"]
handler.command = ["umi-search-meigen", "umi-meigen", "umi-meigens", "meigen", "meigens"]
handler.tags = ["search"]
handler.description = "Cari prompt dari Meigen AI"
handler.importSource = "umi"
handler.importConfig = {"name": "meigen", "alias": ["meigens"], "category": "search", "description": "Cari prompt dari Meigen AI", "usage": ".meigen <query>", "example": ".meigen anime girl", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-meigen": "meigen", "umi-meigen": "meigen", "umi-meigens": "meigens", "meigen": "meigen", "meigens": "meigens"}
export default handler
