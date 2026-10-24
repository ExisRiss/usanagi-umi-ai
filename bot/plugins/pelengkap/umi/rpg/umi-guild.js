/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "guild", "category": "rpg", "aliasMap": {"umi-rpg-guild": "guild", "umi-guild": "guild", "umi-clan": "clan", "umi-team": "team", "umi-kelompok": "kelompok"}, "description": "Sistem guild/clan", "usage": ".guild <create/join/leave/info>", "example": ".guild create DragonSlayers", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/guild.js", metadata, m, extra)
handler.help = ["umi-rpg-guild <create/join/leave/info>"]
handler.command = ["umi-rpg-guild", "umi-guild", "umi-clan", "umi-team", "umi-kelompok"]
handler.tags = ["rpg"]
handler.description = "Sistem guild/clan"
handler.importSource = "umi"
handler.importConfig = {"name": "guild", "alias": ["clan", "team", "kelompok"], "category": "rpg", "description": "Sistem guild/clan", "usage": ".guild <create/join/leave/info>", "example": ".guild create DragonSlayers", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-guild": "guild", "umi-guild": "guild", "umi-clan": "clan", "umi-team": "team", "umi-kelompok": "kelompok"}
export default handler
