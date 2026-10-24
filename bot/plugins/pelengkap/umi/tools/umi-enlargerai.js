/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "enlargerai", "category": "tools", "aliasMap": {"umi-tools-enlargerai": "enlargerai", "umi-enlargerai": "enlargerai", "umi-enlargeraiphotos": "enlargeraiphotos", "umi-enlarger": "enlarger", "enlargerai": "enlargerai", "enlargeraiphotos": "enlargeraiphotos", "enlarger": "enlarger"}, "description": "Meningkatkan kualitas gambar (HD, Retouch, Sharpen) dengan Enlargerai", "usage": ".enlargerai [mode] [reply/kirim gambar]", "example": ".enlargerai upscale", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/enlargerai.js", metadata, m, extra)
handler.help = ["umi-tools-enlargerai [mode] [reply/kirim gambar]"]
handler.command = ["umi-tools-enlargerai", "umi-enlargerai", "umi-enlargeraiphotos", "umi-enlarger", "enlargerai", "enlargeraiphotos", "enlarger"]
handler.tags = ["tools"]
handler.description = "Meningkatkan kualitas gambar (HD, Retouch, Sharpen) dengan Enlargerai"
handler.importSource = "umi"
handler.importConfig = {"name": "enlargerai", "alias": ["enlargeraiphotos", "enlarger"], "category": "tools", "description": "Meningkatkan kualitas gambar (HD, Retouch, Sharpen) dengan Enlargerai", "usage": ".enlargerai [mode] [reply/kirim gambar]", "example": ".enlargerai upscale", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-enlargerai": "enlargerai", "umi-enlargerai": "enlargerai", "umi-enlargeraiphotos": "enlargeraiphotos", "umi-enlarger": "enlarger", "enlargerai": "enlargerai", "enlargeraiphotos": "enlargeraiphotos", "enlarger": "enlarger"}
export default handler
