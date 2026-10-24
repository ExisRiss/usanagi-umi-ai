import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pastebin", "category": "tools", "aliasMap": {"umi-tools-pastebin": "pastebin", "umi-paste": "paste", "umi-pb": "pb", "paste": "paste", "pb": "pb"}, "description": "Upload teks ke Pastebin", "usage": ".pastebin <text>", "example": ".pastebin console.log(\"Hello World\")", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/pastebin.js", metadata, m, extra)
handler.help = ["umi-tools-pastebin <text>"]
handler.command = ["umi-tools-pastebin", "umi-paste", "umi-pb", "paste", "pb"]
handler.tags = ["tools"]
handler.description = "Upload teks ke Pastebin"
handler.importSource = "umi"
handler.importConfig = {"name": "pastebin", "alias": ["paste", "pb"], "category": "tools", "description": "Upload teks ke Pastebin", "usage": ".pastebin <text>", "example": ".pastebin console.log(\"Hello World\")", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-pastebin": "pastebin", "umi-paste": "paste", "umi-pb": "pb", "paste": "paste", "pb": "pb"}
export default handler
