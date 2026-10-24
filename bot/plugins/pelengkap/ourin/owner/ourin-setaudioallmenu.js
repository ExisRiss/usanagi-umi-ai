/* Ported from ourin; original author credits remain in integrations/ourin/plugins/owner/setaudioallmenu.js. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setaudioallmenu", "category": "owner", "aliasMap": {"ourin-owner-setaudioallmenu": "setaudioallmenu", "ourin-setaudioallmenu": "setaudioallmenu", "ourin-setaudioam": "setaudioam", "ourin-audioallmenu": "audioallmenu", "setaudioallmenu": "setaudioallmenu", "setaudioam": "setaudioam", "audioallmenu": "audioallmenu"}, "description": "Mengatur gaya audio untuk All Menu", "usage": ".setaudioallmenu <1-4>", "example": ".setaudioallmenu 1", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("ourin", "plugins/owner/setaudioallmenu.js", metadata, m, extra)
handler.help = ["ourin-owner-setaudioallmenu <1-4>"]
handler.command = ["ourin-owner-setaudioallmenu", "ourin-setaudioallmenu", "ourin-setaudioam", "ourin-audioallmenu", "setaudioallmenu", "setaudioam", "audioallmenu"]
handler.tags = ["owner"]
handler.description = "Mengatur gaya audio untuk All Menu"
handler.importSource = "ourin"
handler.importConfig = {"name": "setaudioallmenu", "alias": ["setaudioam", "audioallmenu"], "category": "owner", "description": "Mengatur gaya audio untuk All Menu", "usage": ".setaudioallmenu <1-4>", "example": ".setaudioallmenu 1", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"ourin-owner-setaudioallmenu": "setaudioallmenu", "ourin-setaudioallmenu": "setaudioallmenu", "ourin-setaudioam": "setaudioam", "ourin-audioallmenu": "audioallmenu", "setaudioallmenu": "setaudioallmenu", "setaudioam": "setaudioam", "audioallmenu": "audioallmenu"}
export default handler
