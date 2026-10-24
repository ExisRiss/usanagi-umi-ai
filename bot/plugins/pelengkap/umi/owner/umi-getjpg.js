/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "getjpg", "category": "owner", "aliasMap": {"umi-owner-getjpg": "getjpg", "umi-getjpg": "getjpg", "umi-lihatjpg": "lihatjpg", "umi-showjpg": "showjpg", "getjpg": "getjpg", "lihatjpg": "lihatjpg", "showjpg": "showjpg"}, "description": "Ambil gambar dari folder assets/images", "usage": ".getjpg <nama_file.jpg>", "example": ".getjpg zerotwo.jpg", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/getjpg.js", metadata, m, extra)
handler.help = ["umi-owner-getjpg <nama_file.jpg>"]
handler.command = ["umi-owner-getjpg", "umi-getjpg", "umi-lihatjpg", "umi-showjpg", "getjpg", "lihatjpg", "showjpg"]
handler.tags = ["owner"]
handler.description = "Ambil gambar dari folder assets/images"
handler.importSource = "umi"
handler.importConfig = {"name": "getjpg", "alias": ["lihatjpg", "showjpg"], "category": "owner", "description": "Ambil gambar dari folder assets/images", "usage": ".getjpg <nama_file.jpg>", "example": ".getjpg zerotwo.jpg", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-getjpg": "getjpg", "umi-getjpg": "getjpg", "umi-lihatjpg": "lihatjpg", "umi-showjpg": "showjpg", "getjpg": "getjpg", "lihatjpg": "lihatjpg", "showjpg": "showjpg"}
export default handler
