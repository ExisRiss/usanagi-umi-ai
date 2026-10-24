import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ssdesktop", "category": "tools", "aliasMap": {"umi-tools-ssdesktop": "ssdesktop", "umi-ssdesktop": "ssdesktop", "umi-sspc": "sspc", "umi-sspcweb": "sspcweb", "umi-ssd": "ssd", "ssdesktop": "ssdesktop", "sspc": "sspc", "sspcweb": "sspcweb", "ssd": "ssd"}, "description": "Mengambil screenshot website tampilan PC/Desktop", "usage": ".ssdesktop <url>", "example": ".ssdesktop https://google.com", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ssdesktop.js", metadata, m, extra)
handler.help = ["umi-tools-ssdesktop <url>"]
handler.command = ["umi-tools-ssdesktop", "umi-ssdesktop", "umi-sspc", "umi-sspcweb", "umi-ssd", "ssdesktop", "sspc", "sspcweb", "ssd"]
handler.tags = ["tools"]
handler.description = "Mengambil screenshot website tampilan PC/Desktop"
handler.importSource = "umi"
handler.importConfig = {"name": "ssdesktop", "alias": ["ssdesktop", "sspc", "sspcweb", "ssd"], "category": "tools", "description": "Mengambil screenshot website tampilan PC/Desktop", "usage": ".ssdesktop <url>", "example": ".ssdesktop https://google.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-ssdesktop": "ssdesktop", "umi-ssdesktop": "ssdesktop", "umi-sspc": "sspc", "umi-sspcweb": "sspcweb", "umi-ssd": "ssd", "ssdesktop": "ssdesktop", "sspc": "sspc", "sspcweb": "sspcweb", "ssd": "ssd"}
export default handler
