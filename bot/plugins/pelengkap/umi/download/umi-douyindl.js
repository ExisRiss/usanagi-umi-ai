import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "douyindl", "category": "download", "aliasMap": {"umi-download-douyindl": "douyindl", "umi-douyindl": "douyindl", "umi-douyin": "douyin", "umi-dydl": "dydl", "douyindl": "douyindl", "dydl": "dydl"}, "description": "Download video/audio dari Douyin (TikTok China)", "usage": ".douyindl <url>", "example": ".douyindl https://v.douyin.com/xxx", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/douyindl.js", metadata, m, extra)
handler.help = ["umi-download-douyindl <url>"]
handler.command = ["umi-download-douyindl", "umi-douyindl", "umi-douyin", "umi-dydl", "douyindl", "dydl"]
handler.tags = ["download"]
handler.description = "Download video/audio dari Douyin (TikTok China)"
handler.importSource = "umi"
handler.importConfig = {"name": "douyindl", "alias": ["douyin", "dydl"], "category": "download", "description": "Download video/audio dari Douyin (TikTok China)", "usage": ".douyindl <url>", "example": ".douyindl https://v.douyin.com/xxx", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-douyindl": "douyindl", "umi-douyindl": "douyindl", "umi-douyin": "douyin", "umi-dydl": "dydl", "douyindl": "douyindl", "dydl": "dydl"}
export default handler
