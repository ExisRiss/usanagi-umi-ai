import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "izen", "category": "tools", "aliasMap": {"umi-tools-izen": "izen", "umi-izen": "izen", "umi-skiplink": "skiplink", "izen": "izen"}, "description": "Bypass shortlink / skiplink menggunakan izen", "usage": ".izen link", "example": ".izen https://sfl.gl/xxxxx", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/izen.js", metadata, m, extra)
handler.help = ["umi-tools-izen link"]
handler.command = ["umi-tools-izen", "umi-izen", "umi-skiplink", "izen"]
handler.tags = ["tools"]
handler.description = "Bypass shortlink / skiplink menggunakan izen"
handler.importSource = "umi"
handler.importConfig = {"name": "izen", "alias": ["skiplink", "izen"], "category": "tools", "description": "Bypass shortlink / skiplink menggunakan izen", "usage": ".izen link", "example": ".izen https://sfl.gl/xxxxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-izen": "izen", "umi-izen": "izen", "umi-skiplink": "skiplink", "izen": "izen"}
export default handler
