/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "quotephoto", "category": "maker", "aliasMap": {"umi-maker-quotephoto": "quotephoto", "umi-quotephoto": "quotephoto", "umi-qphoto": "qphoto", "umi-quotepic": "quotepic", "umi-katatutur": "katatutur", "umi-picturequote": "picturequote", "quotephoto": "quotephoto", "qphoto": "qphoto", "quotepic": "quotepic", "katatutur": "katatutur", "picturequote": "picturequote"}, "description": "Buat gambar kata-kata quote estetik di atas kertas", "usage": ".quotephoto teks|author", "example": ".quotephoto Jangan ragu untuk memulai hal baru|Geto", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/quotephoto.js", metadata, m, extra)
handler.help = ["umi-maker-quotephoto teks|author"]
handler.command = ["umi-maker-quotephoto", "umi-quotephoto", "umi-qphoto", "umi-quotepic", "umi-katatutur", "umi-picturequote", "quotephoto", "qphoto", "quotepic", "katatutur", "picturequote"]
handler.tags = ["maker"]
handler.description = "Buat gambar kata-kata quote estetik di atas kertas"
handler.importSource = "umi"
handler.importConfig = {"name": "quotephoto", "alias": ["qphoto", "quotepic", "katatutur", "picturequote"], "category": "maker", "description": "Buat gambar kata-kata quote estetik di atas kertas", "usage": ".quotephoto teks|author", "example": ".quotephoto Jangan ragu untuk memulai hal baru|Geto", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-quotephoto": "quotephoto", "umi-quotephoto": "quotephoto", "umi-qphoto": "qphoto", "umi-quotepic": "quotepic", "umi-katatutur": "katatutur", "umi-picturequote": "picturequote", "quotephoto": "quotephoto", "qphoto": "qphoto", "quotepic": "quotepic", "katatutur": "katatutur", "picturequote": "picturequote"}
export default handler
