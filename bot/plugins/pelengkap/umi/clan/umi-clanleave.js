/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanleave", "category": "clan", "aliasMap": {"umi-clan-clanleave": "clanleave", "umi-clanleave": "clanleave", "umi-leaveclan": "leaveclan", "umi-guildleave": "guildleave", "clanleave": "clanleave", "leaveclan": "leaveclan", "guildleave": "guildleave"}, "description": "Keluar dari clan", "usage": ".clanleave", "example": ".clanleave", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanleave.js", metadata, m, extra)
handler.help = ["umi-clan-clanleave"]
handler.command = ["umi-clan-clanleave", "umi-clanleave", "umi-leaveclan", "umi-guildleave", "clanleave", "leaveclan", "guildleave"]
handler.tags = ["clan"]
handler.description = "Keluar dari clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanleave", "alias": ["leaveclan", "guildleave"], "category": "clan", "description": "Keluar dari clan", "usage": ".clanleave", "example": ".clanleave", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanleave": "clanleave", "umi-clanleave": "clanleave", "umi-leaveclan": "leaveclan", "umi-guildleave": "guildleave", "clanleave": "clanleave", "leaveclan": "leaveclan", "guildleave": "guildleave"}
export default handler
