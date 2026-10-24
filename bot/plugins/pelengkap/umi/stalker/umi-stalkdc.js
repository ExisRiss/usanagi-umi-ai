import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stalkdc", "category": "stalker", "aliasMap": {"umi-stalker-stalkdc": "stalkdc", "umi-cekkdc": "cekkdc", "cekkdc": "cekkdc"}, "description": "Mengetahui info profil akun Discord berdasarkan ID", "usage": ".stalkdc <id_discord>", "example": ".stalkdc 1280009524941426700", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/stalkdc.js", metadata, m, extra)
handler.help = ["umi-stalker-stalkdc <id_discord>"]
handler.command = ["umi-stalker-stalkdc", "umi-cekkdc", "cekkdc"]
handler.tags = ["stalker"]
handler.description = "Mengetahui info profil akun Discord berdasarkan ID"
handler.importSource = "umi"
handler.importConfig = {"name": "stalkdc", "alias": ["discordstalk", "cekkdc", "stalkdiscord"], "category": "stalker", "description": "Mengetahui info profil akun Discord berdasarkan ID", "usage": ".stalkdc <id_discord>", "example": ".stalkdc 1280009524941426700", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-stalkdc": "stalkdc", "umi-cekkdc": "cekkdc", "cekkdc": "cekkdc"}
export default handler
