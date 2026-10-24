/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "slowmode", "category": "group", "aliasMap": {"umi-group-slowmode": "slowmode", "umi-slowmode": "slowmode", "umi-slow": "slow", "umi-setslowmode": "setslowmode", "slowmode": "slowmode", "slow": "slow", "setslowmode": "setslowmode"}, "description": "Slowmode grup — batasi kecepatan pesan member", "usage": ".slowmode <on/off/onlycommand> [detik]", "example": ".slowmode on 30", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/slowmode.js", metadata, m, extra)
handler.help = ["umi-group-slowmode <on/off/onlycommand> [detik]"]
handler.command = ["umi-group-slowmode", "umi-slowmode", "umi-slow", "umi-setslowmode", "slowmode", "slow", "setslowmode"]
handler.tags = ["group"]
handler.description = "Slowmode grup — batasi kecepatan pesan member"
handler.importSource = "umi"
handler.importConfig = {"name": "slowmode", "alias": ["slow", "setslowmode"], "category": "group", "description": "Slowmode grup — batasi kecepatan pesan member", "usage": ".slowmode <on/off/onlycommand> [detik]", "example": ".slowmode on 30", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-slowmode": "slowmode", "umi-slowmode": "slowmode", "umi-slow": "slow", "umi-setslowmode": "setslowmode", "slowmode": "slowmode", "slow": "slow", "setslowmode": "setslowmode"}
export default handler
