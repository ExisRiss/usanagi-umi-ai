/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jualan", "category": "rpg", "aliasMap": {"umi-rpg-jualan": "jualan", "umi-jualan": "jualan", "umi-dagang": "dagang", "umi-pedagang": "pedagang"}, "description": "Dagang asongan keliling", "usage": ".jualan", "example": ".jualan", "cooldown": 180, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/jualan.js", metadata, m, extra)
handler.help = ["umi-rpg-jualan"]
handler.command = ["umi-rpg-jualan", "umi-jualan", "umi-dagang", "umi-pedagang"]
handler.tags = ["rpg"]
handler.description = "Dagang asongan keliling"
handler.importSource = "umi"
handler.importConfig = {"name": "jualan", "alias": ["dagang", "pedagang"], "category": "rpg", "description": "Dagang asongan keliling", "usage": ".jualan", "example": ".jualan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 180, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-jualan": "jualan", "umi-jualan": "jualan", "umi-dagang": "dagang", "umi-pedagang": "pedagang"}
export default handler
