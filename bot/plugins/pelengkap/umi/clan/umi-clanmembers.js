import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanmembers", "category": "clan", "aliasMap": {"umi-clan-clanmembers": "clanmembers", "umi-clanmembers": "clanmembers", "umi-clanmember": "clanmember", "umi-guildmembers": "guildmembers", "clanmembers": "clanmembers", "clanmember": "clanmember", "guildmembers": "guildmembers"}, "description": "Lihat daftar member clan", "usage": ".clanmembers", "example": ".clanmembers", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanmembers.js", metadata, m, extra)
handler.help = ["umi-clan-clanmembers"]
handler.command = ["umi-clan-clanmembers", "umi-clanmembers", "umi-clanmember", "umi-guildmembers", "clanmembers", "clanmember", "guildmembers"]
handler.tags = ["clan"]
handler.description = "Lihat daftar member clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanmembers", "alias": ["clanmember", "guildmembers"], "category": "clan", "description": "Lihat daftar member clan", "usage": ".clanmembers", "example": ".clanmembers", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanmembers": "clanmembers", "umi-clanmembers": "clanmembers", "umi-clanmember": "clanmember", "umi-guildmembers": "guildmembers", "clanmembers": "clanmembers", "clanmember": "clanmember", "guildmembers": "guildmembers"}
export default handler
