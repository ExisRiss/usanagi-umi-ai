/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "anticolong", "category": "sticker", "aliasMap": {"umi-sticker-anticolong": "anticolong", "umi-anticolong": "anticolong", "umi-ac": "ac", "umi-anticolongsticker": "anticolongsticker", "umi-acsticker": "acsticker", "ac": "ac", "anticolongsticker": "anticolongsticker", "acsticker": "acsticker"}, "description": "Mengubah stiker biasa menjadi anti-colong (tidak bisa diforward/save)", "usage": ".anticolong (reply pesan stiker)", "example": ".anticolong", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/anticolong.js", metadata, m, extra)
handler.help = ["umi-sticker-anticolong (reply pesan stiker)"]
handler.command = ["umi-sticker-anticolong", "umi-anticolong", "umi-ac", "umi-anticolongsticker", "umi-acsticker", "ac", "anticolongsticker", "acsticker"]
handler.tags = ["sticker"]
handler.description = "Mengubah stiker biasa menjadi anti-colong (tidak bisa diforward/save)"
handler.importSource = "umi"
handler.importConfig = {"name": "anticolong", "alias": ["ac", "anticolongsticker", "acsticker"], "category": "sticker", "description": "Mengubah stiker biasa menjadi anti-colong (tidak bisa diforward/save)", "usage": ".anticolong (reply pesan stiker)", "example": ".anticolong", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "isAdmin": false, "isBotAdmin": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-anticolong": "anticolong", "umi-anticolong": "anticolong", "umi-ac": "ac", "umi-anticolongsticker": "anticolongsticker", "umi-acsticker": "acsticker", "ac": "ac", "anticolongsticker": "anticolongsticker", "acsticker": "acsticker"}
export default handler
