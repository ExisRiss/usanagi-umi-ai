import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "treasure", "category": "rpg", "aliasMap": {"umi-rpg-treasure": "treasure", "umi-treasure": "treasure", "umi-chest": "chest", "umi-peti": "peti", "umi-openbox": "openbox"}, "description": "Buka treasure chest untuk hadiah random", "usage": ".treasure", "example": ".treasure", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/treasure.js", metadata, m, extra)
handler.help = ["umi-rpg-treasure"]
handler.command = ["umi-rpg-treasure", "umi-treasure", "umi-chest", "umi-peti", "umi-openbox"]
handler.tags = ["rpg"]
handler.description = "Buka treasure chest untuk hadiah random"
handler.importSource = "umi"
handler.importConfig = {"name": "treasure", "alias": ["chest", "peti", "openbox"], "category": "rpg", "description": "Buka treasure chest untuk hadiah random", "usage": ".treasure", "example": ".treasure", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-treasure": "treasure", "umi-treasure": "treasure", "umi-chest": "chest", "umi-peti": "peti", "umi-openbox": "openbox"}
export default handler
