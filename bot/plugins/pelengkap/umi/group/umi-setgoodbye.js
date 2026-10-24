import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setgoodbye", "category": "group", "aliasMap": {"umi-group-setgoodbye": "setgoodbye", "umi-setgoodbye": "setgoodbye", "umi-customgoodbye": "customgoodbye", "customgoodbye": "customgoodbye"}, "description": "Set custom goodbye message", "usage": ".setgoodbye <pesan>", "example": ".setgoodbye Bye {user}, sampai jumpa lagi!", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/setgoodbye.js", metadata, m, extra)
handler.help = ["umi-group-setgoodbye <pesan>"]
handler.command = ["umi-group-setgoodbye", "umi-setgoodbye", "umi-customgoodbye", "customgoodbye"]
handler.tags = ["group"]
handler.description = "Set custom goodbye message"
handler.importSource = "umi"
handler.importConfig = {"name": "setgoodbye", "alias": ["customgoodbye"], "category": "group", "description": "Set custom goodbye message", "usage": ".setgoodbye <pesan>", "example": ".setgoodbye Bye {user}, sampai jumpa lagi!", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-setgoodbye": "setgoodbye", "umi-setgoodbye": "setgoodbye", "umi-customgoodbye": "customgoodbye", "customgoodbye": "customgoodbye"}
export default handler
