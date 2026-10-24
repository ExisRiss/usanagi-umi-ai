/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addjpg", "category": "owner", "aliasMap": {"umi-owner-addjpg": "addjpg", "umi-addjpg": "addjpg", "umi-addimage": "addimage", "umi-tambahjpg": "tambahjpg", "umi-setjpg": "setjpg", "addjpg": "addjpg", "addimage": "addimage", "tambahjpg": "tambahjpg", "setjpg": "setjpg"}, "description": "Tambah gambar baru ke folder assets/images", "usage": ".addjpg <nama_file.jpg> (reply gambar)", "example": ".addjpg zerotwo.jpg", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addjpg.js", metadata, m, extra)
handler.help = ["umi-owner-addjpg <nama_file.jpg> (reply gambar)"]
handler.command = ["umi-owner-addjpg", "umi-addjpg", "umi-addimage", "umi-tambahjpg", "umi-setjpg", "addjpg", "addimage", "tambahjpg", "setjpg"]
handler.tags = ["owner"]
handler.description = "Tambah gambar baru ke folder assets/images"
handler.importSource = "umi"
handler.importConfig = {"name": "addjpg", "alias": ["addimage", "tambahjpg", "setjpg"], "category": "owner", "description": "Tambah gambar baru ke folder assets/images", "usage": ".addjpg <nama_file.jpg> (reply gambar)", "example": ".addjpg zerotwo.jpg", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addjpg": "addjpg", "umi-addjpg": "addjpg", "umi-addimage": "addimage", "umi-tambahjpg": "tambahjpg", "umi-setjpg": "setjpg", "addjpg": "addjpg", "addimage": "addimage", "tambahjpg": "tambahjpg", "setjpg": "setjpg"}
export default handler
