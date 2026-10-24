/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "botmode", "category": "group", "aliasMap": {"umi-group-botmode": "botmode", "botmode": "botmode", "setmode": "setmode", "mode": "mode"}, "description": "Atur mode bot untuk grup ini", "usage": ".botmode <md/cpanel/pushkontak/store/otp/all>", "example": ".botmode store", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/botmode.js", metadata, m, extra)
handler.help = ["umi-group-botmode <md/cpanel/pushkontak/store/otp/all>"]
handler.command = ["umi-group-botmode", "botmode", "setmode", "mode"]
handler.tags = ["group"]
handler.description = "Atur mode bot untuk grup ini"
handler.importSource = "umi"
handler.importConfig = {"name": "botmode", "alias": ["setmode", "mode"], "category": "group", "description": "Atur mode bot untuk grup ini", "usage": ".botmode <md/cpanel/pushkontak/store/otp/all>", "example": ".botmode store", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-botmode": "botmode", "botmode": "botmode", "setmode": "setmode", "mode": "mode"}
export default handler
