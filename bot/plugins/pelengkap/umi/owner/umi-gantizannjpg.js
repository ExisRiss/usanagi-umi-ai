/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ganti-zann.jpg", "category": "owner", "aliasMap": {"umi-owner-ganti-zann.jpg": "ganti-zann.jpg", "umi-ganzann": "ganzann", "umi-setzann": "setzann", "ganzann": "ganzann", "setzann": "setzann"}, "description": "Ganti gambar Zann.jpg (thumbnail menu)", "usage": ".ganti-zann.jpg (reply/kirim gambar)", "example": ".ganti-zann.jpg", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/gantizannjpg.js", metadata, m, extra)
handler.help = ["umi-owner-ganti-zann.jpg .jpg (reply/kirim gambar)"]
handler.command = ["umi-owner-ganti-zann.jpg", "umi-ganzann", "umi-setzann", "ganzann", "setzann"]
handler.tags = ["owner"]
handler.description = "Ganti gambar Zann.jpg (thumbnail menu)"
handler.importSource = "umi"
handler.importConfig = {"name": "ganti-zann.jpg", "alias": ["ganzann", "setzann"], "category": "owner", "description": "Ganti gambar Zann.jpg (thumbnail menu)", "usage": ".ganti-zann.jpg (reply/kirim gambar)", "example": ".ganti-zann.jpg", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-ganti-zann.jpg": "ganti-zann.jpg", "umi-ganzann": "ganzann", "umi-setzann": "setzann", "ganzann": "ganzann", "setzann": "setzann"}
export default handler
