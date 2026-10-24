/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hd3", "category": "tools", "aliasMap": {"umi-tools-hd3": "hd3", "umi-hd3": "hd3", "umi-enhance3": "enhance3", "umi-upscale3": "upscale3", "umi-unblur": "unblur"}, "description": "Memperjelas gambar blur menjadi tajam dengan AI (Unblur)", "usage": ".hd3 (reply gambar)", "example": ".hd3", "cooldown": 20, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hd3.js", metadata, m, extra)
handler.help = ["umi-tools-hd3 (reply gambar)"]
handler.command = ["umi-tools-hd3", "umi-hd3", "umi-enhance3", "umi-upscale3", "umi-unblur"]
handler.tags = ["tools"]
handler.description = "Memperjelas gambar blur menjadi tajam dengan AI (Unblur)"
handler.importSource = "umi"
handler.importConfig = {"name": "hd3", "alias": ["enhance3", "upscale3", "unblur"], "category": "tools", "description": "Memperjelas gambar blur menjadi tajam dengan AI (Unblur)", "usage": ".hd3 (reply gambar)", "example": ".hd3", "cooldown": 20, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-hd3": "hd3", "umi-hd3": "hd3", "umi-enhance3": "enhance3", "umi-upscale3": "upscale3", "umi-unblur": "unblur"}
export default handler
