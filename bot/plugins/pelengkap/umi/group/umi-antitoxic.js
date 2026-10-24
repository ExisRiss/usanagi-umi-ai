import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antitoxic", "category": "group", "aliasMap": {"umi-group-antitoxic": "antitoxic", "umi-antitoxic": "antitoxic", "umi-toxic": "toxic", "umi-antitoxik": "antitoxik", "toxic": "toxic", "antitoxik": "antitoxik"}, "description": "Mengatur antitoxic di grup", "usage": ".antitoxic <on/off/warn/metode>", "example": ".antitoxic on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antitoxic.js", metadata, m, extra)
handler.help = ["umi-group-antitoxic <on/off/warn/metode>"]
handler.command = ["umi-group-antitoxic", "umi-antitoxic", "umi-toxic", "umi-antitoxik", "toxic", "antitoxik"]
handler.tags = ["group"]
handler.description = "Mengatur antitoxic di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antitoxic", "alias": ["toxic", "antitoxik"], "category": "group", "description": "Mengatur antitoxic di grup", "usage": ".antitoxic <on/off/warn/metode>", "example": ".antitoxic on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antitoxic": "antitoxic", "umi-antitoxic": "antitoxic", "umi-toxic": "toxic", "umi-antitoxik": "antitoxik", "toxic": "toxic", "antitoxik": "antitoxik"}
export default handler
