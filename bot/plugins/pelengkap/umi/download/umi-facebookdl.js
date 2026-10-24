/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "facebookdl", "category": "download", "aliasMap": {"umi-download-facebookdl": "facebookdl", "umi-facebookdl": "facebookdl", "umi-fbdown": "fbdown", "umi-facebook": "facebook", "umi-fbdl": "fbdl", "facebookdl": "facebookdl"}, "description": "Download video Facebook", "usage": ".facebookdl <url>", "example": ".facebookdl https://www.facebook.com/watch?v=xxx", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/facebookdl.js", metadata, m, extra)
handler.help = ["umi-download-facebookdl <url>"]
handler.command = ["umi-download-facebookdl", "umi-facebookdl", "umi-fbdown", "umi-facebook", "umi-fbdl", "facebookdl"]
handler.tags = ["download"]
handler.description = "Download video Facebook"
handler.importSource = "umi"
handler.importConfig = {"name": "facebookdl", "alias": ["fbdown", "fb", "facebook", "fbdl"], "category": "download", "description": "Download video Facebook", "usage": ".facebookdl <url>", "example": ".facebookdl https://www.facebook.com/watch?v=xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-facebookdl": "facebookdl", "umi-facebookdl": "facebookdl", "umi-fbdown": "fbdown", "umi-facebook": "facebook", "umi-fbdl": "fbdl", "facebookdl": "facebookdl"}
export default handler
