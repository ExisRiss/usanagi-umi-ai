/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mediafiredl", "category": "download", "aliasMap": {"umi-download-mediafiredl": "mediafiredl", "umi-mediafiredl": "mediafiredl", "umi-mfdl": "mfdl", "umi-mediafire": "mediafire", "umi-mf": "mf", "mediafiredl": "mediafiredl", "mfdl": "mfdl"}, "description": "Download file dari MediaFire", "usage": ".mfdl <url>", "example": ".mfdl https://www.mediafire.com/file/xxx", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/mediafiredl.js", metadata, m, extra)
handler.help = ["umi-download-mediafiredl <url>"]
handler.command = ["umi-download-mediafiredl", "umi-mediafiredl", "umi-mfdl", "umi-mediafire", "umi-mf", "mediafiredl", "mfdl"]
handler.tags = ["download"]
handler.description = "Download file dari MediaFire"
handler.importSource = "umi"
handler.importConfig = {"name": "mediafiredl", "alias": ["mfdl", "mediafire", "mf"], "category": "download", "description": "Download file dari MediaFire", "usage": ".mfdl <url>", "example": ".mfdl https://www.mediafire.com/file/xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-mediafiredl": "mediafiredl", "umi-mediafiredl": "mediafiredl", "umi-mfdl": "mfdl", "umi-mediafire": "mediafire", "umi-mf": "mf", "mediafiredl": "mediafiredl", "mfdl": "mfdl"}
export default handler
