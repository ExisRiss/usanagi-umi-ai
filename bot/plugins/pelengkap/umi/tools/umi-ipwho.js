/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ipwho", "category": "tools", "aliasMap": {"umi-tools-ipwho": "ipwho", "umi-ipwho": "ipwho", "umi-ip": "ip", "umi-iplookup": "iplookup", "umi-ipinfo": "ipinfo", "ipwho": "ipwho", "ip": "ip", "iplookup": "iplookup", "ipinfo": "ipinfo"}, "description": "Lookup informasi IP address", "usage": ".ipwho <ip>", "example": ".ipwho 8.8.8.8", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ipwho.js", metadata, m, extra)
handler.help = ["umi-tools-ipwho <ip>"]
handler.command = ["umi-tools-ipwho", "umi-ipwho", "umi-ip", "umi-iplookup", "umi-ipinfo", "ipwho", "ip", "iplookup", "ipinfo"]
handler.tags = ["tools"]
handler.description = "Lookup informasi IP address"
handler.importSource = "umi"
handler.importConfig = {"name": "ipwho", "alias": ["ip", "iplookup", "ipinfo"], "category": "tools", "description": "Lookup informasi IP address", "usage": ".ipwho <ip>", "example": ".ipwho 8.8.8.8", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-ipwho": "ipwho", "umi-ipwho": "ipwho", "umi-ip": "ip", "umi-iplookup": "iplookup", "umi-ipinfo": "ipinfo", "ipwho": "ipwho", "ip": "ip", "iplookup": "iplookup", "ipinfo": "ipinfo"}
export default handler
