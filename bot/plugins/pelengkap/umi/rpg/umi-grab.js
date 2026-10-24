import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "taksi", "category": "rpg", "aliasMap": {"umi-rpg-taksi": "taksi", "umi-taksi": "taksi", "umi-grab": "grab", "umi-megrab": "megrab", "taksi": "taksi", "grab": "grab", "megrab": "megrab"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/grab.js", metadata, m, extra)
handler.help = ["umi-rpg-taksi"]
handler.command = ["umi-rpg-taksi", "umi-taksi", "umi-grab", "umi-megrab", "taksi", "grab", "megrab"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "taksi", "alias": ["grab", "megrab"], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-taksi": "taksi", "umi-taksi": "taksi", "umi-grab": "grab", "umi-megrab": "megrab", "taksi": "taksi", "grab": "grab", "megrab": "megrab"}
export default handler
