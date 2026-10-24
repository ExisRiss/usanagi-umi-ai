import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sapa", "category": "general", "aliasMap": {"umi-general-sapa": "sapa", "umi-sapa": "sapa", "umi-greet": "greet", "umi-sayhi": "sayhi", "sapa": "sapa", "greet": "greet", "sayhi": "sayhi"}, "description": "Umi nyapa kamu dengan random pesan manis", "usage": ".sapa", "example": ".sapa", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/general/sapa.js", metadata, m, extra)
handler.help = ["umi-general-sapa"]
handler.command = ["umi-general-sapa", "umi-sapa", "umi-greet", "umi-sayhi", "sapa", "greet", "sayhi"]
handler.tags = ["general"]
handler.description = "Umi nyapa kamu dengan random pesan manis"
handler.importSource = "umi"
handler.importConfig = {"name": "sapa", "alias": ["greet", "sayhi"], "category": "general", "description": "Umi nyapa kamu dengan random pesan manis", "usage": ".sapa", "example": ".sapa", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-general-sapa": "sapa", "umi-sapa": "sapa", "umi-greet": "greet", "umi-sayhi": "sayhi", "sapa": "sapa", "greet": "greet", "sayhi": "sayhi"}
export default handler
