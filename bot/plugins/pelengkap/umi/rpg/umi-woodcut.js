/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "woodcut", "category": "rpg", "aliasMap": {"umi-rpg-woodcut": "woodcut", "umi-woodcut": "woodcut", "umi-chop": "chop", "umi-nebang": "nebang", "umi-kayu": "kayu"}, "description": "Menebang pohon untuk mendapatkan kayu", "usage": ".woodcut", "example": ".woodcut", "cooldown": 60, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/woodcut.js", metadata, m, extra)
handler.help = ["umi-rpg-woodcut"]
handler.command = ["umi-rpg-woodcut", "umi-woodcut", "umi-chop", "umi-nebang", "umi-kayu"]
handler.tags = ["rpg"]
handler.description = "Menebang pohon untuk mendapatkan kayu"
handler.importSource = "umi"
handler.importConfig = {"name": "woodcut", "alias": ["chop", "nebang", "kayu"], "category": "rpg", "description": "Menebang pohon untuk mendapatkan kayu", "usage": ".woodcut", "example": ".woodcut", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-woodcut": "woodcut", "umi-woodcut": "woodcut", "umi-chop": "chop", "umi-nebang": "nebang", "umi-kayu": "kayu"}
export default handler
