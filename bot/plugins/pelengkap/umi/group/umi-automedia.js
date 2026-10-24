/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "automedia", "category": "group", "aliasMap": {"umi-group-automedia": "automedia", "umi-automedia": "automedia", "umi-automedi": "automedi", "automedia": "automedia", "automedi": "automedi"}, "description": "Toggle auto media - otomatis jadikan sticker jadi gambar/video", "usage": ".automedia on/off", "example": ".automedia on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/automedia.js", metadata, m, extra)
handler.help = ["umi-group-automedia on/off"]
handler.command = ["umi-group-automedia", "umi-automedia", "umi-automedi", "automedia", "automedi"]
handler.tags = ["group"]
handler.description = "Toggle auto media - otomatis jadikan sticker jadi gambar/video"
handler.importSource = "umi"
handler.importConfig = {"name": "automedia", "alias": ["automedi", "am"], "category": "group", "description": "Toggle auto media - otomatis jadikan sticker jadi gambar/video", "usage": ".automedia on/off", "example": ".automedia on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-automedia": "automedia", "umi-automedia": "automedia", "umi-automedi": "automedi", "automedia": "automedia", "automedi": "automedi"}
export default handler
