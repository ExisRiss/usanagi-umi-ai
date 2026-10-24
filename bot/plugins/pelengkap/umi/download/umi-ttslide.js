/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ttslide", "category": "download", "aliasMap": {"umi-download-ttslide": "ttslide", "umi-ttslide": "ttslide", "umi-tiktokslide": "tiktokslide", "ttslide": "ttslide", "tiktokslide": "tiktokslide"}, "description": "Mengambil semua gambar dari TikTok photo/slideshow", "usage": ".ttslide <url>", "example": ".ttslide https://vt.tiktok.com/xxxx/", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/ttslide.js", metadata, m, extra)
handler.help = ["umi-download-ttslide <url>"]
handler.command = ["umi-download-ttslide", "umi-ttslide", "umi-tiktokslide", "ttslide", "tiktokslide"]
handler.tags = ["download"]
handler.description = "Mengambil semua gambar dari TikTok photo/slideshow"
handler.importSource = "umi"
handler.importConfig = {"name": "ttslide", "alias": ["tiktokslide"], "category": "download", "description": "Mengambil semua gambar dari TikTok photo/slideshow", "usage": ".ttslide <url>", "example": ".ttslide https://vt.tiktok.com/xxxx/", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-ttslide": "ttslide", "umi-ttslide": "ttslide", "umi-tiktokslide": "tiktokslide", "ttslide": "ttslide", "tiktokslide": "tiktokslide"}
export default handler
