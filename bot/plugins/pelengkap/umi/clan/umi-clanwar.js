/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanwar", "category": "clan", "aliasMap": {"umi-clan-clanwar": "clanwar", "umi-clanwar": "clanwar", "umi-war": "war", "umi-guildwar": "guildwar", "clanwar": "clanwar", "war": "war", "guildwar": "guildwar"}, "description": "War melawan clan lain", "usage": ".clanwar <clan_id>", "example": ".clanwar clan_123456", "cooldown": 3600, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanwar.js", metadata, m, extra)
handler.help = ["umi-clan-clanwar <clan_id>"]
handler.command = ["umi-clan-clanwar", "umi-clanwar", "umi-war", "umi-guildwar", "clanwar", "war", "guildwar"]
handler.tags = ["clan"]
handler.description = "War melawan clan lain"
handler.importSource = "umi"
handler.importConfig = {"name": "clanwar", "alias": ["war", "guildwar"], "category": "clan", "description": "War melawan clan lain", "usage": ".clanwar <clan_id>", "example": ".clanwar clan_123456", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3600, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanwar": "clanwar", "umi-clanwar": "clanwar", "umi-war": "war", "umi-guildwar": "guildwar", "clanwar": "clanwar", "war": "war", "guildwar": "guildwar"}
export default handler
