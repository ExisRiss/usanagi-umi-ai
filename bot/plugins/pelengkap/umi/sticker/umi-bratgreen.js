/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bratgreen", "category": "sticker", "aliasMap": {"umi-sticker-bratgreen": "bratgreen", "umi-bratgreen": "bratgreen", "umi-brat2": "brat2", "bratgreen": "bratgreen"}, "description": "Membuat sticker brat ijo", "usage": ".brat2 <text>", "example": ".brat2 Hai semua", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/bratgreen.js", metadata, m, extra)
handler.help = ["umi-sticker-bratgreen <text>"]
handler.command = ["umi-sticker-bratgreen", "umi-bratgreen", "umi-brat2", "bratgreen"]
handler.tags = ["sticker"]
handler.description = "Membuat sticker brat ijo"
handler.importSource = "umi"
handler.importConfig = {"name": "bratgreen", "alias": ["brat2"], "category": "sticker", "description": "Membuat sticker brat ijo", "usage": ".brat2 <text>", "example": ".brat2 Hai semua", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-bratgreen": "bratgreen", "umi-bratgreen": "bratgreen", "umi-brat2": "brat2", "bratgreen": "bratgreen"}
export default handler
