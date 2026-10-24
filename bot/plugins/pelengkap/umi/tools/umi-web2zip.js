import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "web2zip", "category": "tools", "aliasMap": {"umi-tools-web2zip": "web2zip", "umi-web2zip": "web2zip", "umi-saveweb2zip": "saveweb2zip", "web2zip": "web2zip", "saveweb2zip": "saveweb2zip"}, "description": "Salin website menjadi file ZIP", "usage": ".web2zip <url>", "example": ".web2zip https://example.com", "cooldown": 30, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/web2zip.js", metadata, m, extra)
handler.help = ["umi-tools-web2zip <url>"]
handler.command = ["umi-tools-web2zip", "umi-web2zip", "umi-saveweb2zip", "web2zip", "saveweb2zip"]
handler.tags = ["tools"]
handler.description = "Salin website menjadi file ZIP"
handler.importSource = "umi"
handler.importConfig = {"name": "web2zip", "alias": ["saveweb2zip"], "category": "tools", "description": "Salin website menjadi file ZIP", "usage": ".web2zip <url>", "example": ".web2zip https://example.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-web2zip": "web2zip", "umi-web2zip": "web2zip", "umi-saveweb2zip": "saveweb2zip", "web2zip": "web2zip", "saveweb2zip": "saveweb2zip"}
export default handler
