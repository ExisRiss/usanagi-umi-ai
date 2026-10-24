/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "weekly", "category": "rpg", "aliasMap": {"umi-rpg-weekly": "weekly", "umi-weekly": "weekly", "umi-mingguan": "mingguan"}, "description": "Claim hadiah mingguan (lebih besar dari daily)", "usage": ".weekly", "example": ".weekly", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/weekly.js", metadata, m, extra)
handler.help = ["umi-rpg-weekly"]
handler.command = ["umi-rpg-weekly", "umi-weekly", "umi-mingguan"]
handler.tags = ["rpg"]
handler.description = "Claim hadiah mingguan (lebih besar dari daily)"
handler.importSource = "umi"
handler.importConfig = {"name": "weekly", "alias": ["mingguan"], "category": "rpg", "description": "Claim hadiah mingguan (lebih besar dari daily)", "usage": ".weekly", "example": ".weekly", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-weekly": "weekly", "umi-weekly": "weekly", "umi-mingguan": "mingguan"}
export default handler
