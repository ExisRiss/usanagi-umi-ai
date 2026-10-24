import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lookup", "category": "tools", "aliasMap": {"umi-tools-lookup": "lookup", "umi-lookup": "lookup", "umi-dnslookup": "dnslookup", "umi-dns": "dns", "umi-whois": "whois", "lookup": "lookup", "dnslookup": "dnslookup", "dns": "dns", "whois": "whois"}, "description": "DNS Lookup untuk domain", "usage": ".lookup <domain>", "example": ".lookup google.com", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/lookup.js", metadata, m, extra)
handler.help = ["umi-tools-lookup <domain>"]
handler.command = ["umi-tools-lookup", "umi-lookup", "umi-dnslookup", "umi-dns", "umi-whois", "lookup", "dnslookup", "dns", "whois"]
handler.tags = ["tools"]
handler.description = "DNS Lookup untuk domain"
handler.importSource = "umi"
handler.importConfig = {"name": "lookup", "alias": ["dnslookup", "dns", "whois"], "category": "tools", "description": "DNS Lookup untuk domain", "usage": ".lookup <domain>", "example": ".lookup google.com", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-lookup": "lookup", "umi-lookup": "lookup", "umi-dnslookup": "dnslookup", "umi-dns": "dns", "umi-whois": "whois", "lookup": "lookup", "dnslookup": "dnslookup", "dns": "dns", "whois": "whois"}
export default handler
