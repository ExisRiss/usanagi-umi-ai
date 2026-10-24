/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "berburu", "category": "rpg", "aliasMap": {"umi-rpg-berburu": "berburu", "umi-huntanimal": "huntanimal", "umi-buru": "buru"}, "description": "Berburu hewan untuk mendapat item", "usage": ".berburu", "example": ".berburu", "cooldown": 120, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/berburu.js", metadata, m, extra)
handler.help = ["umi-rpg-berburu"]
handler.command = ["umi-rpg-berburu", "umi-huntanimal", "umi-buru"]
handler.tags = ["rpg"]
handler.description = "Berburu hewan untuk mendapat item"
handler.importSource = "umi"
handler.importConfig = {"name": "berburu", "alias": ["huntanimal", "buru"], "category": "rpg", "description": "Berburu hewan untuk mendapat item", "usage": ".berburu", "example": ".berburu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 120, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-berburu": "berburu", "umi-huntanimal": "huntanimal", "umi-buru": "buru"}
export default handler
