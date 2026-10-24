/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autojoingc", "category": "owner", "aliasMap": {"umi-owner-autojoingc": "autojoingc", "umi-autojoingc": "autojoingc", "umi-autojoin": "autojoin", "umi-autojoingroup": "autojoingroup", "autojoingc": "autojoingc", "autojoin": "autojoin", "autojoingroup": "autojoingroup"}, "description": "Auto join grup dari link yang terdeteksi di chat", "usage": ".autojoingc on/off", "example": ".autojoingc on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/autojoingc.js", metadata, m, extra)
handler.help = ["umi-owner-autojoingc on/off"]
handler.command = ["umi-owner-autojoingc", "umi-autojoingc", "umi-autojoin", "umi-autojoingroup", "autojoingc", "autojoin", "autojoingroup"]
handler.tags = ["owner"]
handler.description = "Auto join grup dari link yang terdeteksi di chat"
handler.importSource = "umi"
handler.importConfig = {"name": "autojoingc", "alias": ["autojoin", "autojoingroup"], "category": "owner", "description": "Auto join grup dari link yang terdeteksi di chat", "usage": ".autojoingc on/off", "example": ".autojoingc on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-autojoingc": "autojoingc", "umi-autojoingc": "autojoingc", "umi-autojoin": "autojoin", "umi-autojoingroup": "autojoingroup", "autojoingc": "autojoingc", "autojoin": "autojoin", "autojoingroup": "autojoingroup"}
export default handler
