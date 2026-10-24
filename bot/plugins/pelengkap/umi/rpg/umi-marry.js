/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "marry", "category": "rpg", "aliasMap": {"umi-rpg-marry": "marry", "umi-marry": "marry", "umi-nikah": "nikah", "umi-wedding": "wedding"}, "description": "Menikahi player lain", "usage": ".marry @user", "example": ".marry @user", "cooldown": 60, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/rpg/marry.js", metadata, m, extra)
handler.help = ["umi-rpg-marry @user"]
handler.command = ["umi-rpg-marry", "umi-marry", "umi-nikah", "umi-wedding"]
handler.tags = ["rpg"]
handler.description = "Menikahi player lain"
handler.importSource = "umi"
handler.importConfig = {"name": "marry", "alias": ["nikah", "wedding", "propose"], "category": "rpg", "description": "Menikahi player lain", "usage": ".marry @user", "example": ".marry @user", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 60, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-rpg-marry": "marry", "umi-marry": "marry", "umi-nikah": "nikah", "umi-wedding": "wedding"}
export default handler
