/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "berladang", "category": "rpg", "aliasMap": {"umi-rpg-berladang": "berladang", "umi-berladang": "berladang", "umi-berkebun": "berkebun"}, "description": "Berladang untuk mendapat hasil panen", "usage": ".berladang", "example": ".berladang", "cooldown": 180, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/berladang.js", metadata, m, extra)
handler.help = ["umi-rpg-berladang"]
handler.command = ["umi-rpg-berladang", "umi-berladang", "umi-berkebun"]
handler.tags = ["rpg"]
handler.description = "Berladang untuk mendapat hasil panen"
handler.importSource = "umi"
handler.importConfig = {"name": "berladang", "alias": ["farm", "tanam", "berkebun"], "category": "rpg", "description": "Berladang untuk mendapat hasil panen", "usage": ".berladang", "example": ".berladang", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 180, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-berladang": "berladang", "umi-berladang": "berladang", "umi-berkebun": "berkebun"}
export default handler
