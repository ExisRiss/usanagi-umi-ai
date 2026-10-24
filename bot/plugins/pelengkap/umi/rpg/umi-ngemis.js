/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ngemis", "category": "rpg", "aliasMap": {"umi-rpg-ngemis": "ngemis", "umi-gembel": "gembel"}, "description": "Ngemis di jalanan dengan peluang dapat Nasi Bungkus (Tambah stamina)", "usage": ".ngemis", "example": ".ngemis", "cooldown": 120, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/ngemis.js", metadata, m, extra)
handler.help = ["umi-rpg-ngemis"]
handler.command = ["umi-rpg-ngemis", "umi-gembel"]
handler.tags = ["rpg"]
handler.description = "Ngemis di jalanan dengan peluang dapat Nasi Bungkus (Tambah stamina)"
handler.importSource = "umi"
handler.importConfig = {"name": "ngemis", "alias": ["minta", "gembel"], "category": "rpg", "description": "Ngemis di jalanan dengan peluang dapat Nasi Bungkus (Tambah stamina)", "usage": ".ngemis", "example": ".ngemis", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-ngemis": "ngemis", "umi-gembel": "gembel"}
export default handler
