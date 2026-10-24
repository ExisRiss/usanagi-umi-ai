/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "freelance", "category": "rpg", "aliasMap": {"umi-rpg-freelance": "freelance", "umi-freelance": "freelance", "umi-desain": "desain", "umi-koding": "koding"}, "description": "Mengerjakan project online klien bule", "usage": ".freelance", "example": ".freelance", "cooldown": 200, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/freelance.js", metadata, m, extra)
handler.help = ["umi-rpg-freelance"]
handler.command = ["umi-rpg-freelance", "umi-freelance", "umi-desain", "umi-koding"]
handler.tags = ["rpg"]
handler.description = "Mengerjakan project online klien bule"
handler.importSource = "umi"
handler.importConfig = {"name": "freelance", "alias": ["desain", "koding"], "category": "rpg", "description": "Mengerjakan project online klien bule", "usage": ".freelance", "example": ".freelance", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 200, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-freelance": "freelance", "umi-freelance": "freelance", "umi-desain": "desain", "umi-koding": "koding"}
export default handler
