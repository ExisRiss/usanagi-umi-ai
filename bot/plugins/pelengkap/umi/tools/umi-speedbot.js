import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "speedbot", "category": "tools", "aliasMap": {"umi-tools-speedbot": "speedbot", "umi-speedbot": "speedbot", "umi-speed-bot": "speed-bot", "umi-serverinfo": "serverinfo", "speedbot": "speedbot", "speed-bot": "speed-bot", "serverinfo": "serverinfo"}, "description": "Menampilkan statistik performa server bot", "usage": ".speedbot", "example": ".speedbot", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/speedbot.js", metadata, m, extra)
handler.help = ["umi-tools-speedbot"]
handler.command = ["umi-tools-speedbot", "umi-speedbot", "umi-speed-bot", "umi-serverinfo", "speedbot", "speed-bot", "serverinfo"]
handler.tags = ["tools"]
handler.description = "Menampilkan statistik performa server bot"
handler.importSource = "umi"
handler.importConfig = {"name": "speedbot", "alias": ["speed-bot", "serverinfo"], "category": "tools", "description": "Menampilkan statistik performa server bot", "usage": ".speedbot", "example": ".speedbot", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-speedbot": "speedbot", "umi-speedbot": "speedbot", "umi-speed-bot": "speed-bot", "umi-serverinfo": "serverinfo", "speedbot": "speedbot", "speed-bot": "speed-bot", "serverinfo": "serverinfo"}
export default handler
