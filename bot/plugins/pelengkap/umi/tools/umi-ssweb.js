import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ssweb", "category": "tools", "aliasMap": {"umi-tools-ssweb": "ssweb", "umi-ssweb": "ssweb", "umi-screenshot": "screenshot", "umi-ss": "ss", "umi-webss": "webss", "screenshot": "screenshot"}, "description": "Screenshot website", "usage": ".ssweb <url>", "example": ".ssweb https://google.com", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ssweb.js", metadata, m, extra)
handler.help = ["umi-tools-ssweb <url>"]
handler.command = ["umi-tools-ssweb", "umi-ssweb", "umi-screenshot", "umi-ss", "umi-webss", "screenshot"]
handler.tags = ["tools"]
handler.description = "Screenshot website"
handler.importSource = "umi"
handler.importConfig = {"name": "ssweb", "alias": ["screenshot", "ss", "webss"], "category": "tools", "description": "Screenshot website", "usage": ".ssweb <url>", "example": ".ssweb https://google.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-ssweb": "ssweb", "umi-ssweb": "ssweb", "umi-screenshot": "screenshot", "umi-ss": "ss", "umi-webss": "webss", "screenshot": "screenshot"}
export default handler
