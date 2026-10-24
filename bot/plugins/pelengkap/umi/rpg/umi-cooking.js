import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cooking", "category": "rpg", "aliasMap": {"umi-rpg-cooking": "cooking", "umi-cooking": "cooking", "umi-chef": "chef"}, "description": "Masak makanan untuk stamina dan HP", "usage": ".cooking <recipe>", "example": ".cooking friedrice", "cooldown": 60, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/cooking.js", metadata, m, extra)
handler.help = ["umi-rpg-cooking <recipe>"]
handler.command = ["umi-rpg-cooking", "umi-cooking", "umi-chef"]
handler.tags = ["rpg"]
handler.description = "Masak makanan untuk stamina dan HP"
handler.importSource = "umi"
handler.importConfig = {"name": "cooking", "alias": ["chef"], "category": "rpg", "description": "Masak makanan untuk stamina dan HP", "usage": ".cooking <recipe>", "example": ".cooking friedrice", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-cooking": "cooking", "umi-cooking": "cooking", "umi-chef": "chef"}
export default handler
