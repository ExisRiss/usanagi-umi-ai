import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "garden", "category": "rpg", "aliasMap": {"umi-rpg-garden": "garden", "umi-garden": "garden", "umi-kebun": "kebun"}, "description": "Berkebun dan panen tanaman", "usage": ".garden <plant/harvest/status>", "example": ".garden plant carrot", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/garden.js", metadata, m, extra)
handler.help = ["umi-rpg-garden <plant/harvest/status>"]
handler.command = ["umi-rpg-garden", "umi-garden", "umi-kebun"]
handler.tags = ["rpg"]
handler.description = "Berkebun dan panen tanaman"
handler.importSource = "umi"
handler.importConfig = {"name": "garden", "alias": ["kebun", "farm", "tanam"], "category": "rpg", "description": "Berkebun dan panen tanaman", "usage": ".garden <plant/harvest/status>", "example": ".garden plant carrot", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-garden": "garden", "umi-garden": "garden", "umi-kebun": "kebun"}
export default handler
