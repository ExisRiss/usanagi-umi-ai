/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mute", "category": "group", "aliasMap": {"umi-group-mute": "mute", "umi-mute": "mute", "umi-bisukan": "bisukan", "mute": "mute", "bisukan": "bisukan"}, "description": "Bisukan seluruh grup (hanya admin yang bisa kirim pesan)", "usage": ".mute", "example": ".mute", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/mute.js", metadata, m, extra)
handler.help = ["umi-group-mute"]
handler.command = ["umi-group-mute", "umi-mute", "umi-bisukan", "mute", "bisukan"]
handler.tags = ["group"]
handler.description = "Bisukan seluruh grup (hanya admin yang bisa kirim pesan)"
handler.importSource = "umi"
handler.importConfig = {"name": "mute", "alias": ["bisukan"], "category": "group", "description": "Bisukan seluruh grup (hanya admin yang bisa kirim pesan)", "usage": ".mute", "example": ".mute", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-mute": "mute", "umi-mute": "mute", "umi-bisukan": "bisukan", "mute": "mute", "bisukan": "bisukan"}
export default handler
