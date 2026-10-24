/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cmdvn", "category": "owner", "aliasMap": {"umi-owner-cmdvn": "cmdvn", "umi-cmdvn": "cmdvn", "umi-voicecommand": "voicecommand", "umi-vncmd": "vncmd", "cmdvn": "cmdvn", "voicecommand": "voicecommand", "vncmd": "vncmd"}, "description": "Aktifkan command via voice note", "usage": ".cmdvn <on/off>", "example": ".cmdvn on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/cmdvn.js", metadata, m, extra)
handler.help = ["umi-owner-cmdvn <on/off>"]
handler.command = ["umi-owner-cmdvn", "umi-cmdvn", "umi-voicecommand", "umi-vncmd", "cmdvn", "voicecommand", "vncmd"]
handler.tags = ["owner"]
handler.description = "Aktifkan command via voice note"
handler.importSource = "umi"
handler.importConfig = {"name": "cmdvn", "alias": ["voicecommand", "vncmd"], "category": "owner", "description": "Aktifkan command via voice note", "usage": ".cmdvn <on/off>", "example": ".cmdvn on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-cmdvn": "cmdvn", "umi-cmdvn": "cmdvn", "umi-voicecommand": "voicecommand", "umi-vncmd": "vncmd", "cmdvn": "cmdvn", "voicecommand": "voicecommand", "vncmd": "vncmd"}
export default handler
