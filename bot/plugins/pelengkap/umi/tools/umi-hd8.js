import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hd8", "category": "tools", "aliasMap": {"umi-tools-hd8": "hd8", "umi-hd8": "hd8", "umi-remini8": "remini8", "umi-upscale1": "upscale1", "umi-enhance8": "enhance8", "hd8": "hd8", "remini8": "remini8", "upscale1": "upscale1", "enhance8": "enhance8"}, "description": "Meningkatkan resolusi gambar hingga 4x lipat (Upscale v1)", "usage": ".hd8 [resolusi 2|4] (balas/kirim gambar)", "example": ".hd8 4", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hd8.js", metadata, m, extra)
handler.help = ["umi-tools-hd8 [resolusi 2|4] (balas/kirim gambar)"]
handler.command = ["umi-tools-hd8", "umi-hd8", "umi-remini8", "umi-upscale1", "umi-enhance8", "hd8", "remini8", "upscale1", "enhance8"]
handler.tags = ["tools"]
handler.description = "Meningkatkan resolusi gambar hingga 4x lipat (Upscale v1)"
handler.importSource = "umi"
handler.importConfig = {"name": "hd8", "alias": ["remini8", "upscale1", "enhance8"], "category": "tools", "description": "Meningkatkan resolusi gambar hingga 4x lipat (Upscale v1)", "usage": ".hd8 [resolusi 2|4] (balas/kirim gambar)", "example": ".hd8 4", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-hd8": "hd8", "umi-hd8": "hd8", "umi-remini8": "remini8", "umi-upscale1": "upscale1", "umi-enhance8": "enhance8", "hd8": "hd8", "remini8": "remini8", "upscale1": "upscale1", "enhance8": "enhance8"}
export default handler
