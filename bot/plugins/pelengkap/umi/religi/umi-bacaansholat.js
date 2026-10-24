import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bacaansholat", "category": "religi", "aliasMap": {"umi-religi-bacaansholat": "bacaansholat", "umi-bacaansholat": "bacaansholat", "umi-bacaan": "bacaan", "bacaansholat": "bacaansholat", "bacaan": "bacaan"}, "description": "Bacaan sholat lengkap dari takbir sampai salam", "usage": ".bacaansholat", "example": ".bacaansholat", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/religi/bacaansholat.js", metadata, m, extra)
handler.help = ["umi-religi-bacaansholat"]
handler.command = ["umi-religi-bacaansholat", "umi-bacaansholat", "umi-bacaan", "bacaansholat", "bacaan"]
handler.tags = ["religi"]
handler.description = "Bacaan sholat lengkap dari takbir sampai salam"
handler.importSource = "umi"
handler.importConfig = {"name": "bacaansholat", "alias": ["bacaan", "bacaan salat"], "category": "religi", "description": "Bacaan sholat lengkap dari takbir sampai salam", "usage": ".bacaansholat", "example": ".bacaansholat", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-bacaansholat": "bacaansholat", "umi-bacaansholat": "bacaansholat", "umi-bacaan": "bacaan", "bacaansholat": "bacaansholat", "bacaan": "bacaan"}
export default handler
