import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hd4", "category": "tools", "aliasMap": {"umi-tools-hd4": "hd4", "umi-hd4": "hd4", "umi-upscale4": "upscale4", "hd4": "hd4", "upscale4": "upscale4"}, "description": "Memperjelas resolusi gambar / dokumen foto (Upscale 4x)", "usage": ".hd4 <reply/kirim gambar atau dokumen foto>", "example": ".hd4", "cooldown": 15, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hd4.js", metadata, m, extra)
handler.help = ["umi-tools-hd4 <reply/kirim gambar atau dokumen foto>"]
handler.command = ["umi-tools-hd4", "umi-hd4", "umi-upscale4", "hd4", "upscale4"]
handler.tags = ["tools"]
handler.description = "Memperjelas resolusi gambar / dokumen foto (Upscale 4x)"
handler.importSource = "umi"
handler.importConfig = {"name": "hd4", "alias": ["upscale4"], "category": "tools", "description": "Memperjelas resolusi gambar / dokumen foto (Upscale 4x)", "usage": ".hd4 <reply/kirim gambar atau dokumen foto>", "example": ".hd4", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-hd4": "hd4", "umi-hd4": "hd4", "umi-upscale4": "upscale4", "hd4": "hd4", "upscale4": "upscale4"}
export default handler
