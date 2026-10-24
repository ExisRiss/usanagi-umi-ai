import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "shopeedl", "category": "download", "aliasMap": {"umi-download-shopeedl": "shopeedl", "umi-shopeedl": "shopeedl", "umi-shopeevideo": "shopeevideo", "umi-shopeevid": "shopeevid", "shopeedl": "shopeedl", "shopeevideo": "shopeevideo", "shopeevid": "shopeevid"}, "description": "Download video dari Shopee", "usage": ".shopeedl <url>", "example": ".shopeedl https://shopee.co.id/universal-link/video/...", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/download/shopeedl.js", metadata, m, extra)
handler.help = ["umi-download-shopeedl <url>"]
handler.command = ["umi-download-shopeedl", "umi-shopeedl", "umi-shopeevideo", "umi-shopeevid", "shopeedl", "shopeevideo", "shopeevid"]
handler.tags = ["download"]
handler.description = "Download video dari Shopee"
handler.importSource = "umi"
handler.importConfig = {"name": "shopeedl", "alias": ["shopeevideo", "shopeevid"], "category": "download", "description": "Download video dari Shopee", "usage": ".shopeedl <url>", "example": ".shopeedl https://shopee.co.id/universal-link/video/...", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-download-shopeedl": "shopeedl", "umi-shopeedl": "shopeedl", "umi-shopeevideo": "shopeevideo", "umi-shopeevid": "shopeevid", "shopeedl": "shopeedl", "shopeevideo": "shopeevideo", "shopeevid": "shopeevid"}
export default handler
