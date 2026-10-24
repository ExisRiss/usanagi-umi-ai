import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "craft", "category": "rpg", "aliasMap": {"umi-rpg-craft": "craft", "umi-craft": "craft", "umi-buat": "buat", "umi-create": "create"}, "description": "Craft item dari materials", "usage": ".craft <item>", "example": ".craft sword", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/craft.js", metadata, m, extra)
handler.help = ["umi-rpg-craft <item>"]
handler.command = ["umi-rpg-craft", "umi-craft", "umi-buat", "umi-create"]
handler.tags = ["rpg"]
handler.description = "Craft item dari materials"
handler.importSource = "umi"
handler.importConfig = {"name": "craft", "alias": ["buat", "create"], "category": "rpg", "description": "Craft item dari materials", "usage": ".craft <item>", "example": ".craft sword", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-craft": "craft", "umi-craft": "craft", "umi-buat": "buat", "umi-create": "create"}
export default handler
