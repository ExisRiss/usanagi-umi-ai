import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "get", "category": "owner", "aliasMap": {"umi-owner-get": "get", "umi-get": "get", "umi-fetch": "fetch", "umi-http": "http", "umi-request": "request", "umi-curl": "curl", "http": "http", "request": "request", "curl": "curl"}, "description": "Advanced HTTP request tool (Owner Only)", "usage": ".get <url> [options]", "example": ".get https://api.example.com --method POST --json {\"key\":\"value\"} --header \"Authorization: Bearer token\"", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/get.js", metadata, m, extra)
handler.help = ["umi-owner-get <url> [options]"]
handler.command = ["umi-owner-get", "umi-get", "umi-fetch", "umi-http", "umi-request", "umi-curl", "http", "request", "curl"]
handler.tags = ["owner"]
handler.description = "Advanced HTTP request tool (Owner Only)"
handler.importSource = "umi"
handler.importConfig = {"name": "get", "alias": ["fetch", "http", "request", "curl"], "category": "owner", "description": "Advanced HTTP request tool (Owner Only)", "usage": ".get <url> [options]", "example": ".get https://api.example.com --method POST --json {\"key\":\"value\"} --header \"Authorization: Bearer token\"", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-get": "get", "umi-get": "get", "umi-fetch": "fetch", "umi-http": "http", "umi-request": "request", "umi-curl": "curl", "http": "http", "request": "request", "curl": "curl"}
export default handler
