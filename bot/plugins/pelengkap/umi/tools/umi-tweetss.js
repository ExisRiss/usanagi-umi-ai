import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tweetss", "category": "tools", "aliasMap": {"umi-tools-tweetss": "tweetss", "umi-tweetss": "tweetss", "umi-orshot": "orshot", "umi-tweetimage": "tweetimage", "umi-tweetimg": "tweetimg", "tweetss": "tweetss", "orshot": "orshot", "tweetimage": "tweetimage", "tweetimg": "tweetimg"}, "description": "Membuat gambar screenshot aesthetic dari link postingan X (Twitter)", "usage": ".tweetss <url tweet>", "example": ".tweetss https://x.com/i/status/2026539641311199692", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/tweetss.js", metadata, m, extra)
handler.help = ["umi-tools-tweetss <url tweet>"]
handler.command = ["umi-tools-tweetss", "umi-tweetss", "umi-orshot", "umi-tweetimage", "umi-tweetimg", "tweetss", "orshot", "tweetimage", "tweetimg"]
handler.tags = ["tools"]
handler.description = "Membuat gambar screenshot aesthetic dari link postingan X (Twitter)"
handler.importSource = "umi"
handler.importConfig = {"name": "tweetss", "alias": ["orshot", "tweetimage", "tweetimg"], "category": "tools", "description": "Membuat gambar screenshot aesthetic dari link postingan X (Twitter)", "usage": ".tweetss <url tweet>", "example": ".tweetss https://x.com/i/status/2026539641311199692", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-tweetss": "tweetss", "umi-tweetss": "tweetss", "umi-orshot": "orshot", "umi-tweetimage": "tweetimage", "umi-tweetimg": "tweetimg", "tweetss": "tweetss", "orshot": "orshot", "tweetimage": "tweetimage", "tweetimg": "tweetimg"}
export default handler
