/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanleaderboard", "category": "clan", "aliasMap": {"umi-clan-clanleaderboard": "clanleaderboard", "umi-clanleaderboard": "clanleaderboard", "umi-clanlb": "clanlb", "umi-topclan": "topclan", "umi-guildrank": "guildrank", "clanleaderboard": "clanleaderboard", "clanlb": "clanlb", "topclan": "topclan", "guildrank": "guildrank"}, "description": "Lihat ranking clan", "usage": ".clanleaderboard", "example": ".clanleaderboard", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanleaderboard.js", metadata, m, extra)
handler.help = ["umi-clan-clanleaderboard"]
handler.command = ["umi-clan-clanleaderboard", "umi-clanleaderboard", "umi-clanlb", "umi-topclan", "umi-guildrank", "clanleaderboard", "clanlb", "topclan", "guildrank"]
handler.tags = ["clan"]
handler.description = "Lihat ranking clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanleaderboard", "alias": ["clanlb", "topclan", "guildrank"], "category": "clan", "description": "Lihat ranking clan", "usage": ".clanleaderboard", "example": ".clanleaderboard", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanleaderboard": "clanleaderboard", "umi-clanleaderboard": "clanleaderboard", "umi-clanlb": "clanlb", "umi-topclan": "topclan", "umi-guildrank": "guildrank", "clanleaderboard": "clanleaderboard", "clanlb": "clanlb", "topclan": "topclan", "guildrank": "guildrank"}
export default handler
