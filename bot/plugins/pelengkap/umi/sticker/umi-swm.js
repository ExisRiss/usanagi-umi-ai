import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "swm", "category": "sticker", "aliasMap": {"umi-sticker-swm": "swm", "umi-swm": "swm", "umi-wm": "wm", "umi-stickerwm": "stickerwm", "umi-stickermark": "stickermark", "umi-colong": "colong", "swm": "swm", "stickerwm": "stickerwm", "stickermark": "stickermark", "colong": "colong"}, "description": "Mengganti packname dan author pada sticker", "usage": ".swm <packname> atau .swm <packname>|<author>", "example": ".swm BotName", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/swm.js", metadata, m, extra)
handler.help = ["umi-sticker-swm <packname> atau .swm <packname>|<author>"]
handler.command = ["umi-sticker-swm", "umi-swm", "umi-wm", "umi-stickerwm", "umi-stickermark", "umi-colong", "swm", "stickerwm", "stickermark", "colong"]
handler.tags = ["sticker"]
handler.description = "Mengganti packname dan author pada sticker"
handler.importSource = "umi"
handler.importConfig = {"name": "swm", "alias": ["wm", "stickerwm", "stickermark", "colong"], "category": "sticker", "description": "Mengganti packname dan author pada sticker", "usage": ".swm <packname> atau .swm <packname>|<author>", "example": ".swm BotName", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-swm": "swm", "umi-swm": "swm", "umi-wm": "wm", "umi-stickerwm": "stickerwm", "umi-stickermark": "stickermark", "umi-colong": "colong", "swm": "swm", "stickerwm": "stickerwm", "stickermark": "stickermark", "colong": "colong"}
export default handler
