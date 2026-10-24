/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "instagramdl", "category": "download", "aliasMap": {"umi-download-instagramdl": "instagramdl", "umi-instagramdl": "instagramdl", "umi-igdl": "igdl", "umi-ig": "ig", "umi-instagram": "instagram", "instagramdl": "instagramdl"}, "description": "Download video/foto Instagram", "usage": ".instagramdl <url>", "example": ".instagramdl https://www.instagram.com/reel/xxx", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/instagramdl.js", metadata, m, extra)
handler.help = ["umi-download-instagramdl <url>"]
handler.command = ["umi-download-instagramdl", "umi-instagramdl", "umi-igdl", "umi-ig", "umi-instagram", "instagramdl"]
handler.tags = ["download"]
handler.description = "Download video/foto Instagram"
handler.importSource = "umi"
handler.importConfig = {"name": "instagramdl", "alias": ["igdl", "ig", "instagram"], "category": "download", "description": "Download video/foto Instagram", "usage": ".instagramdl <url>", "example": ".instagramdl https://www.instagram.com/reel/xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-instagramdl": "instagramdl", "umi-instagramdl": "instagramdl", "umi-igdl": "igdl", "umi-ig": "ig", "umi-instagram": "instagram", "instagramdl": "instagramdl"}
export default handler
