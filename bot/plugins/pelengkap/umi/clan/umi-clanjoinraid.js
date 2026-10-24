/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanraidjoin", "category": "clan", "aliasMap": {"umi-clan-clanraidjoin": "clanraidjoin", "umi-clanraidjoin": "clanraidjoin", "umi-raidjoin": "raidjoin", "umi-raidkill": "raidkill", "clanraidjoin": "clanraidjoin", "raidjoin": "raidjoin", "raidkill": "raidkill"}, "description": "Join raid clan dan kill monster", "usage": ".clanraidjoin", "example": ".clanraidjoin", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanjoinraid.js", metadata, m, extra)
handler.help = ["umi-clan-clanraidjoin"]
handler.command = ["umi-clan-clanraidjoin", "umi-clanraidjoin", "umi-raidjoin", "umi-raidkill", "clanraidjoin", "raidjoin", "raidkill"]
handler.tags = ["clan"]
handler.description = "Join raid clan dan kill monster"
handler.importSource = "umi"
handler.importConfig = {"name": "clanraidjoin", "alias": ["raidjoin", "raidkill"], "category": "clan", "description": "Join raid clan dan kill monster", "usage": ".clanraidjoin", "example": ".clanraidjoin", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-clan-clanraidjoin": "clanraidjoin", "umi-clanraidjoin": "clanraidjoin", "umi-raidjoin": "raidjoin", "umi-raidkill": "raidkill", "clanraidjoin": "clanraidjoin", "raidjoin": "raidjoin", "raidkill": "raidkill"}
export default handler
