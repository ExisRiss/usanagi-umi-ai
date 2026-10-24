/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "goodbyeall", "category": "owner", "aliasMap": {"umi-owner-goodbyeall": "goodbyeall", "umi-goodbyeall": "goodbyeall", "umi-gball": "gball", "umi-globalgoodbye": "globalgoodbye", "umi-leaveall": "leaveall", "goodbyeall": "goodbyeall", "gball": "gball", "globalgoodbye": "globalgoodbye", "leaveall": "leaveall"}, "description": "Aktifkan/nonaktifkan goodbye di semua grup", "usage": ".goodbyeall <on/off>", "example": ".goodbyeall on", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/goodbyeall.js", metadata, m, extra)
handler.help = ["umi-owner-goodbyeall <on/off>"]
handler.command = ["umi-owner-goodbyeall", "umi-goodbyeall", "umi-gball", "umi-globalgoodbye", "umi-leaveall", "goodbyeall", "gball", "globalgoodbye", "leaveall"]
handler.tags = ["owner"]
handler.description = "Aktifkan/nonaktifkan goodbye di semua grup"
handler.importSource = "umi"
handler.importConfig = {"name": "goodbyeall", "alias": ["gball", "globalgoodbye", "leaveall"], "category": "owner", "description": "Aktifkan/nonaktifkan goodbye di semua grup", "usage": ".goodbyeall <on/off>", "example": ".goodbyeall on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-goodbyeall": "goodbyeall", "umi-goodbyeall": "goodbyeall", "umi-gball": "gball", "umi-globalgoodbye": "globalgoodbye", "umi-leaveall": "leaveall", "goodbyeall": "goodbyeall", "gball": "gball", "globalgoodbye": "globalgoodbye", "leaveall": "leaveall"}
export default handler
