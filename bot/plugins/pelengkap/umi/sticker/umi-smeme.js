import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "smeme", "category": "sticker", "aliasMap": {"umi-sticker-smeme": "smeme", "umi-smeme": "smeme", "umi-memesticker": "memesticker", "umi-memes": "memes", "memesticker": "memesticker", "memes": "memes"}, "description": "Membuat sticker meme dari gambar", "usage": ".smeme <top>|<bottom>", "example": ".smeme Ketika|Kamu Lupa", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/smeme.js", metadata, m, extra)
handler.help = ["umi-sticker-smeme <top>|<bottom>"]
handler.command = ["umi-sticker-smeme", "umi-smeme", "umi-memesticker", "umi-memes", "memesticker", "memes"]
handler.tags = ["sticker"]
handler.description = "Membuat sticker meme dari gambar"
handler.importSource = "umi"
handler.importConfig = {"name": "smeme", "alias": ["memesticker", "memes"], "category": "sticker", "description": "Membuat sticker meme dari gambar", "usage": ".smeme <top>|<bottom>", "example": ".smeme Ketika|Kamu Lupa", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-smeme": "smeme", "umi-smeme": "smeme", "umi-memesticker": "memesticker", "umi-memes": "memes", "memesticker": "memesticker", "memes": "memes"}
export default handler
