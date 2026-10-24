/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "toimg", "category": "tools", "aliasMap": {"umi-tools-toimg": "toimg", "umi-toimg": "toimg", "umi-toimage": "toimage", "umi-stickertoimage": "stickertoimage", "umi-stimg": "stimg"}, "description": "Mengubah sticker menjadi gambar", "usage": ".toimg (reply/caption sticker)", "example": ".toimg", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/toimg.js", metadata, m, extra)
handler.help = ["umi-tools-toimg (reply/caption sticker)"]
handler.command = ["umi-tools-toimg", "umi-toimg", "umi-toimage", "umi-stickertoimage", "umi-stimg"]
handler.tags = ["tools"]
handler.description = "Mengubah sticker menjadi gambar"
handler.importSource = "umi"
handler.importConfig = {"name": "toimg", "alias": ["toimage", "stickertoimage", "stimg"], "category": "tools", "description": "Mengubah sticker menjadi gambar", "usage": ".toimg (reply/caption sticker)", "example": ".toimg", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-toimg": "toimg", "umi-toimg": "toimg", "umi-toimage": "toimage", "umi-stickertoimage": "stickertoimage", "umi-stimg": "stimg"}
export default handler
