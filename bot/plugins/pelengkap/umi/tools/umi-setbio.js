/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setbio", "category": "tools", "aliasMap": {"umi-tools-setbio": "setbio", "umi-setbio": "setbio", "umi-setbiobot": "setbiobot", "umi-setstatus": "setstatus", "umi-setabout": "setabout", "setbio": "setbio", "setbiobot": "setbiobot", "setstatus": "setstatus", "setabout": "setabout"}, "description": "Mengubah bio/status bot", "usage": ".setbio <bio baru>", "example": ".setbio Bot WhatsApp by Lucky Archz", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/setbio.js", metadata, m, extra)
handler.help = ["umi-tools-setbio <bio baru>"]
handler.command = ["umi-tools-setbio", "umi-setbio", "umi-setbiobot", "umi-setstatus", "umi-setabout", "setbio", "setbiobot", "setstatus", "setabout"]
handler.tags = ["tools"]
handler.description = "Mengubah bio/status bot"
handler.importSource = "umi"
handler.importConfig = {"name": "setbio", "alias": ["setbiobot", "setstatus", "setabout"], "category": "tools", "description": "Mengubah bio/status bot", "usage": ".setbio <bio baru>", "example": ".setbio Bot WhatsApp by Lucky Archz", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-setbio": "setbio", "umi-setbio": "setbio", "umi-setbiobot": "setbiobot", "umi-setstatus": "setstatus", "umi-setabout": "setabout", "setbio": "setbio", "setbiobot": "setbiobot", "setstatus": "setstatus", "setabout": "setabout"}
export default handler
