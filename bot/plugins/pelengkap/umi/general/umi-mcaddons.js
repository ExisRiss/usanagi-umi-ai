import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mcaddons", "category": "general", "aliasMap": {"umi-general-mcaddons": "mcaddons", "umi-mcaddons": "mcaddons", "umi-mcmap": "mcmap", "mcaddons": "mcaddons", "mcmap": "mcmap"}, "description": "Mencari Minecraft Bedrock addon dan map terbaru", "usage": ".mcaddons [atau .mcmap]", "example": ".mcaddons", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/mcaddons.js", metadata, m, extra)
handler.help = ["umi-general-mcaddons [atau .mcmap]"]
handler.command = ["umi-general-mcaddons", "umi-mcaddons", "umi-mcmap", "mcaddons", "mcmap"]
handler.tags = ["general"]
handler.description = "Mencari Minecraft Bedrock addon dan map terbaru"
handler.importSource = "umi"
handler.importConfig = {"name": "mcaddons", "alias": ["mcmap"], "category": "general", "description": "Mencari Minecraft Bedrock addon dan map terbaru", "usage": ".mcaddons [atau .mcmap]", "example": ".mcaddons", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-general-mcaddons": "mcaddons", "umi-mcaddons": "mcaddons", "umi-mcmap": "mcmap", "mcaddons": "mcaddons", "mcmap": "mcmap"}
export default handler
