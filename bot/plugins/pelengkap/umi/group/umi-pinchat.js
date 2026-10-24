/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "pinchat", "category": "group", "aliasMap": {"umi-group-pinchat": "pinchat", "umi-pinchat": "pinchat", "umi-pinmsg": "pinmsg", "umi-pinpesan": "pinpesan", "pinmsg": "pinmsg"}, "description": "Pin pesan penting di grup", "usage": ".pinchat (reply pesan)", "example": ".pinchat", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/pinchat.js", metadata, m, extra)
handler.help = ["umi-group-pinchat (reply pesan)"]
handler.command = ["umi-group-pinchat", "umi-pinchat", "umi-pinmsg", "umi-pinpesan", "pinmsg"]
handler.tags = ["group"]
handler.description = "Pin pesan penting di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "pinchat", "alias": ["pinmsg", "pinpesan"], "category": "group", "description": "Pin pesan penting di grup", "usage": ".pinchat (reply pesan)", "example": ".pinchat", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-pinchat": "pinchat", "umi-pinchat": "pinchat", "umi-pinmsg": "pinmsg", "umi-pinpesan": "pinpesan", "pinmsg": "pinmsg"}
export default handler
