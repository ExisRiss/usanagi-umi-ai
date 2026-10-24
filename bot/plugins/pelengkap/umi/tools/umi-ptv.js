/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ptv", "category": "tools", "aliasMap": {"umi-tools-ptv": "ptv", "umi-ptv": "ptv", "umi-pvideo": "pvideo", "umi-circlevideo": "circlevideo", "ptv": "ptv", "pvideo": "pvideo", "circlevideo": "circlevideo"}, "description": "Kirim video sebagai PTV (circle video)", "usage": ".ptv (reply video)", "example": ".ptv", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ptv.js", metadata, m, extra)
handler.help = ["umi-tools-ptv (reply video)"]
handler.command = ["umi-tools-ptv", "umi-ptv", "umi-pvideo", "umi-circlevideo", "ptv", "pvideo", "circlevideo"]
handler.tags = ["tools"]
handler.description = "Kirim video sebagai PTV (circle video)"
handler.importSource = "umi"
handler.importConfig = {"name": "ptv", "alias": ["pvideo", "circlevideo"], "category": "tools", "description": "Kirim video sebagai PTV (circle video)", "usage": ".ptv (reply video)", "example": ".ptv", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-ptv": "ptv", "umi-ptv": "ptv", "umi-pvideo": "pvideo", "umi-circlevideo": "circlevideo", "ptv": "ptv", "pvideo": "pvideo", "circlevideo": "circlevideo"}
export default handler
