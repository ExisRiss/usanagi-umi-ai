/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "topanime", "category": "anime", "aliasMap": {"umi-anime-topanime": "topanime", "umi-topanime": "topanime", "umi-top-anime": "top-anime", "umi-waifutop": "waifutop", "topanime": "topanime", "top-anime": "top-anime", "waifutop": "waifutop"}, "description": "Melihat daftar karakter anime / waifu terpopuler", "usage": ".topanime", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/topanime.js", metadata, m, extra)
handler.help = ["umi-anime-topanime"]
handler.command = ["umi-anime-topanime", "umi-topanime", "umi-top-anime", "umi-waifutop", "topanime", "top-anime", "waifutop"]
handler.tags = ["anime"]
handler.description = "Melihat daftar karakter anime / waifu terpopuler"
handler.importSource = "umi"
handler.importConfig = {"name": "topanime", "alias": ["top-anime", "waifutop"], "category": "anime", "description": "Melihat daftar karakter anime / waifu terpopuler", "usage": ".topanime", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-topanime": "topanime", "umi-topanime": "topanime", "umi-top-anime": "top-anime", "umi-waifutop": "waifutop", "topanime": "topanime", "top-anime": "top-anime", "waifutop": "waifutop"}
export default handler
