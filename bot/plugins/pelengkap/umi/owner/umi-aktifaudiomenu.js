/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "aktifaudiomenu", "category": "owner", "aliasMap": {"umi-owner-aktifaudiomenu": "aktifaudiomenu", "umi-aktifaudiomenu": "aktifaudiomenu", "umi-audiomenu": "audiomenu", "umi-setaudiomenu": "setaudiomenu", "umi-toggleaudiomenu": "toggleaudiomenu", "aktifaudiomenu": "aktifaudiomenu", "audiomenu": "audiomenu", "setaudiomenu": "setaudiomenu", "toggleaudiomenu": "toggleaudiomenu"}, "description": "Toggle audio saat menampilkan menu", "usage": ".aktifaudiomenu ya/gak", "example": ".aktifaudiomenu ya", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/aktifaudiomenu.js", metadata, m, extra)
handler.help = ["umi-owner-aktifaudiomenu ya/gak"]
handler.command = ["umi-owner-aktifaudiomenu", "umi-aktifaudiomenu", "umi-audiomenu", "umi-setaudiomenu", "umi-toggleaudiomenu", "aktifaudiomenu", "audiomenu", "setaudiomenu", "toggleaudiomenu"]
handler.tags = ["owner"]
handler.description = "Toggle audio saat menampilkan menu"
handler.importSource = "umi"
handler.importConfig = {"name": "aktifaudiomenu", "alias": ["audiomenu", "setaudiomenu", "toggleaudiomenu"], "category": "owner", "description": "Toggle audio saat menampilkan menu", "usage": ".aktifaudiomenu ya/gak", "example": ".aktifaudiomenu ya", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-aktifaudiomenu": "aktifaudiomenu", "umi-aktifaudiomenu": "aktifaudiomenu", "umi-audiomenu": "audiomenu", "umi-setaudiomenu": "setaudiomenu", "umi-toggleaudiomenu": "toggleaudiomenu", "aktifaudiomenu": "aktifaudiomenu", "audiomenu": "audiomenu", "setaudiomenu": "setaudiomenu", "toggleaudiomenu": "toggleaudiomenu"}
export default handler
