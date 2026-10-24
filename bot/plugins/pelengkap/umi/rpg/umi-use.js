/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "use", "category": "rpg", "aliasMap": {"umi-rpg-use": "use", "umi-use": "use", "umi-pake": "pake", "umi-makan": "makan"}, "description": "Menggunakan item consumable atau membuka crate", "usage": ".use <item>", "example": ".use potion", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/use.js", metadata, m, extra)
handler.help = ["umi-rpg-use <item>"]
handler.command = ["umi-rpg-use", "umi-use", "umi-pake", "umi-makan"]
handler.tags = ["rpg"]
handler.description = "Menggunakan item consumable atau membuka crate"
handler.importSource = "umi"
handler.importConfig = {"name": "use", "alias": ["pake", "makan", "open"], "category": "rpg", "description": "Menggunakan item consumable atau membuka crate", "usage": ".use <item>", "example": ".use potion", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-use": "use", "umi-use": "use", "umi-pake": "pake", "umi-makan": "makan"}
export default handler
