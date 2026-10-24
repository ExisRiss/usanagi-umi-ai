/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delsewa", "category": "owner", "aliasMap": {"umi-owner-delsewa": "delsewa", "umi-delsewa": "delsewa", "umi-sewadel": "sewadel", "umi-hapussewa": "hapussewa", "umi-removesewa": "removesewa", "delsewa": "delsewa", "sewadel": "sewadel", "hapussewa": "hapussewa", "removesewa": "removesewa"}, "description": "Hapus grup dari whitelist sewa", "usage": ".delsewa <link/id grup>", "example": ".delsewa https://chat.whatsapp.com/xxx", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/delsewa.js", metadata, m, extra)
handler.help = ["umi-owner-delsewa <link/id grup>"]
handler.command = ["umi-owner-delsewa", "umi-delsewa", "umi-sewadel", "umi-hapussewa", "umi-removesewa", "delsewa", "sewadel", "hapussewa", "removesewa"]
handler.tags = ["owner"]
handler.description = "Hapus grup dari whitelist sewa"
handler.importSource = "umi"
handler.importConfig = {"name": "delsewa", "alias": ["sewadel", "hapussewa", "removesewa"], "category": "owner", "description": "Hapus grup dari whitelist sewa", "usage": ".delsewa <link/id grup>", "example": ".delsewa https://chat.whatsapp.com/xxx", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-delsewa": "delsewa", "umi-delsewa": "delsewa", "umi-sewadel": "sewadel", "umi-hapussewa": "hapussewa", "umi-removesewa": "removesewa", "delsewa": "delsewa", "sewadel": "sewadel", "hapussewa": "hapussewa", "removesewa": "removesewa"}
export default handler
