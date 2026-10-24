/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stickerpack", "category": "sticker", "aliasMap": {"umi-sticker-stickerpack": "stickerpack", "umi-stickerpack": "stickerpack", "umi-stickersearch": "stickersearch", "umi-searchsticker": "searchsticker", "stickerpack": "stickerpack", "searchsticker": "searchsticker"}, "description": "Cari dan kirim sticker pack", "usage": ".stickerpack <query>", "example": ".stickerpack anime", "cooldown": 20, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/stickerpack.js", metadata, m, extra)
handler.help = ["umi-sticker-stickerpack <query>"]
handler.command = ["umi-sticker-stickerpack", "umi-stickerpack", "umi-stickersearch", "umi-searchsticker", "stickerpack", "searchsticker"]
handler.tags = ["sticker"]
handler.description = "Cari dan kirim sticker pack"
handler.importSource = "umi"
handler.importConfig = {"name": "stickerpack", "alias": ["sp", "stickersearch", "searchsticker"], "category": "sticker", "description": "Cari dan kirim sticker pack", "usage": ".stickerpack <query>", "example": ".stickerpack anime", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 20, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-stickerpack": "stickerpack", "umi-stickerpack": "stickerpack", "umi-stickersearch": "stickersearch", "umi-searchsticker": "searchsticker", "stickerpack": "stickerpack", "searchsticker": "searchsticker"}
export default handler
