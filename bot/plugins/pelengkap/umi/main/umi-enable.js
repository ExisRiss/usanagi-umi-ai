/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "enable", "category": "main", "aliasMap": {"umi-main-enable": "enable", "umi-enable": "enable", "umi-disable": "disable", "umi-on": "on", "umi-off": "off"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/enable.js", metadata, m, extra)
handler.help = ["umi-main-enable"]
handler.command = ["umi-main-enable", "umi-enable", "umi-disable", "umi-on", "umi-off"]
handler.tags = ["main"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "enable", "alias": ["disable", "on", "off"], "category": "main", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-main-enable": "enable", "umi-enable": "enable", "umi-disable": "disable", "umi-on": "on", "umi-off": "off"}
export default handler
