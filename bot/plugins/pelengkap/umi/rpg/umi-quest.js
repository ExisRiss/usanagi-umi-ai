/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "quest", "category": "rpg", "aliasMap": {"umi-rpg-quest": "quest", "umi-quest": "quest", "umi-misi": "misi", "umi-mission": "mission", "umi-bounty": "bounty"}, "description": "Ambil quest harian untuk reward bonus", "usage": ".quest", "example": ".quest", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/quest.js", metadata, m, extra)
handler.help = ["umi-rpg-quest"]
handler.command = ["umi-rpg-quest", "umi-quest", "umi-misi", "umi-mission", "umi-bounty"]
handler.tags = ["rpg"]
handler.description = "Ambil quest harian untuk reward bonus"
handler.importSource = "umi"
handler.importConfig = {"name": "quest", "alias": ["misi", "mission", "bounty"], "category": "rpg", "description": "Ambil quest harian untuk reward bonus", "usage": ".quest", "example": ".quest", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-quest": "quest", "umi-quest": "quest", "umi-misi": "misi", "umi-mission": "mission", "umi-bounty": "bounty"}
export default handler
