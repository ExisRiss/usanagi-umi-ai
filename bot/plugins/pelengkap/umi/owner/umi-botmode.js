/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "botmode", "category": "owner", "aliasMap": {"umi-owner-botmode": "botmode"}, "description": "Mengatur mode bot (md/cpanel/store/pushkontak/all)", "usage": ".botmode <mode>", "example": ".botmode store", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/botmode.js", metadata, m, extra)
handler.help = ["umi-owner-botmode <mode>"]
handler.command = ["umi-owner-botmode"]
handler.tags = ["owner"]
handler.description = "Mengatur mode bot (md/cpanel/store/pushkontak/all)"
handler.importSource = "umi"
handler.importConfig = {"name": "botmode", "alias": ["setmode", "mode"], "category": "owner", "description": "Mengatur mode bot (md/cpanel/store/pushkontak/all)", "usage": ".botmode <mode>", "example": ".botmode store", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-botmode": "botmode"}
export default handler
