/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "membunuh", "category": "rpg", "aliasMap": {"umi-rpg-membunuh": "membunuh", "umi-membunuh": "membunuh", "membunuh": "membunuh"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/membunuh.js", metadata, m, extra)
handler.help = ["umi-rpg-membunuh"]
handler.command = ["umi-rpg-membunuh", "umi-membunuh", "membunuh"]
handler.tags = ["rpg"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "membunuh", "alias": [], "category": "rpg", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-membunuh": "membunuh", "umi-membunuh": "membunuh", "membunuh": "membunuh"}
export default handler
