/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "likeedl", "category": "download", "aliasMap": {"umi-download-likeedl": "likeedl", "umi-likeedl": "likeedl", "umi-lkdl": "lkdl", "umi-likee": "likee", "umi-lk": "lk", "likeedl": "likeedl", "lkdl": "lkdl", "likee": "likee", "lk": "lk"}, "description": "Download video Likee", "usage": ".lkdl <url>", "example": ".lkdl https://likee.video/@xxx", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/likeedl.js", metadata, m, extra)
handler.help = ["umi-download-likeedl <url>"]
handler.command = ["umi-download-likeedl", "umi-likeedl", "umi-lkdl", "umi-likee", "umi-lk", "likeedl", "lkdl", "likee", "lk"]
handler.tags = ["download"]
handler.description = "Download video Likee"
handler.importSource = "umi"
handler.importConfig = {"name": "likeedl", "alias": ["lkdl", "likee", "lk"], "category": "download", "description": "Download video Likee", "usage": ".lkdl <url>", "example": ".lkdl https://likee.video/@xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-likeedl": "likeedl", "umi-likeedl": "likeedl", "umi-lkdl": "lkdl", "umi-likee": "likee", "umi-lk": "lk", "likeedl": "likeedl", "lkdl": "lkdl", "likee": "likee", "lk": "lk"}
export default handler
