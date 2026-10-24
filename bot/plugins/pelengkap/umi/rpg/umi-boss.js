/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "boss", "category": "rpg", "aliasMap": {"umi-rpg-boss": "boss", "umi-boss": "boss", "umi-raidboss": "raidboss", "umi-bigboss": "bigboss"}, "description": "Lawan boss untuk hadiah besar", "usage": ".boss", "example": ".boss", "cooldown": 600, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/boss.js", metadata, m, extra)
handler.help = ["umi-rpg-boss"]
handler.command = ["umi-rpg-boss", "umi-boss", "umi-raidboss", "umi-bigboss"]
handler.tags = ["rpg"]
handler.description = "Lawan boss untuk hadiah besar"
handler.importSource = "umi"
handler.importConfig = {"name": "boss", "alias": ["raidboss", "bigboss"], "category": "rpg", "description": "Lawan boss untuk hadiah besar", "usage": ".boss", "example": ".boss", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 600, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-rpg-boss": "boss", "umi-boss": "boss", "umi-raidboss": "raidboss", "umi-bigboss": "bigboss"}
export default handler
