/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fstik", "category": "sticker", "aliasMap": {"umi-sticker-fstik": "fstik", "umi-fstik": "fstik", "umi-stickerinfo": "stickerinfo", "fstik": "fstik", "stickerinfo": "stickerinfo"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/fstik.js", metadata, m, extra)
handler.help = ["umi-sticker-fstik"]
handler.command = ["umi-sticker-fstik", "umi-fstik", "umi-stickerinfo", "fstik", "stickerinfo"]
handler.tags = ["sticker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "fstik", "alias": ["stickerinfo"], "category": "sticker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-fstik": "fstik", "umi-fstik": "fstik", "umi-stickerinfo": "stickerinfo", "fstik": "fstik", "stickerinfo": "stickerinfo"}
export default handler
