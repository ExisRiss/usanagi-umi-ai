import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "meditation", "category": "rpg", "aliasMap": {"umi-rpg-meditation": "meditation", "umi-meditation": "meditation", "umi-rest": "rest", "umi-istirahat": "istirahat", "umi-tidur": "tidur", "umi-sleep": "sleep"}, "description": "Istirahat untuk pulihkan HP dan stamina", "usage": ".meditation", "example": ".meditation", "cooldown": 600, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/meditation.js", metadata, m, extra)
handler.help = ["umi-rpg-meditation"]
handler.command = ["umi-rpg-meditation", "umi-meditation", "umi-rest", "umi-istirahat", "umi-tidur", "umi-sleep"]
handler.tags = ["rpg"]
handler.description = "Istirahat untuk pulihkan HP dan stamina"
handler.importSource = "umi"
handler.importConfig = {"name": "meditation", "alias": ["rest", "istirahat", "tidur", "sleep"], "category": "rpg", "description": "Istirahat untuk pulihkan HP dan stamina", "usage": ".meditation", "example": ".meditation", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 600, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-meditation": "meditation", "umi-meditation": "meditation", "umi-rest": "rest", "umi-istirahat": "istirahat", "umi-tidur": "tidur", "umi-sleep": "sleep"}
export default handler
