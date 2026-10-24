import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jarvis", "category": "maker", "aliasMap": {"umi-maker-jarvis": "jarvis", "umi-jarvis": "jarvis", "umi-jarvismeme": "jarvismeme", "jarvis": "jarvis", "jarvismeme": "jarvismeme"}, "description": "Membuat meme Jarvis dengan teks custom", "usage": ".jarvis <teks>", "example": ".jarvis Jarvis, tolong atur dulu itu biar ga apa kali", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/jarvis.js", metadata, m, extra)
handler.help = ["umi-maker-jarvis <teks>"]
handler.command = ["umi-maker-jarvis", "umi-jarvis", "umi-jarvismeme", "jarvis", "jarvismeme"]
handler.tags = ["maker"]
handler.description = "Membuat meme Jarvis dengan teks custom"
handler.importSource = "umi"
handler.importConfig = {"name": "jarvis", "alias": ["jarvismeme", "mj"], "category": "maker", "description": "Membuat meme Jarvis dengan teks custom", "usage": ".jarvis <teks>", "example": ".jarvis Jarvis, tolong atur dulu itu biar ga apa kali", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-jarvis": "jarvis", "umi-jarvis": "jarvis", "umi-jarvismeme": "jarvismeme", "jarvis": "jarvis", "jarvismeme": "jarvismeme"}
export default handler
