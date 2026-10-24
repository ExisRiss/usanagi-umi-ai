import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nambalban", "category": "rpg", "aliasMap": {"umi-rpg-nambalban": "nambalban", "umi-nambalban": "nambalban", "umi-tambal": "tambal", "umi-bengkel": "bengkel"}, "description": "Buka jasa tambal ban, awas ban meledak!", "usage": ".nambalban", "example": ".nambalban", "cooldown": 150, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/nambalban.js", metadata, m, extra)
handler.help = ["umi-rpg-nambalban"]
handler.command = ["umi-rpg-nambalban", "umi-nambalban", "umi-tambal", "umi-bengkel"]
handler.tags = ["rpg"]
handler.description = "Buka jasa tambal ban, awas ban meledak!"
handler.importSource = "umi"
handler.importConfig = {"name": "nambalban", "alias": ["tambal", "bengkel"], "category": "rpg", "description": "Buka jasa tambal ban, awas ban meledak!", "usage": ".nambalban", "example": ".nambalban", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 150, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-nambalban": "nambalban", "umi-nambalban": "nambalban", "umi-tambal": "tambal", "umi-bengkel": "bengkel"}
export default handler
