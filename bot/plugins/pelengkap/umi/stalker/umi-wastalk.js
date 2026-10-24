/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wastalk", "category": "stalker", "aliasMap": {"umi-stalker-wastalk": "wastalk", "umi-wastalk": "wastalk", "umi-whatsappstalk": "whatsappstalk", "umi-stalkwa": "stalkwa", "wastalk": "wastalk", "whatsappstalk": "whatsappstalk", "stalkwa": "stalkwa"}, "description": "Stalk profile WhatsApp", "usage": ".wastalk <nomor/tag>", "example": ".wastalk 6281234567890", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/wastalk.js", metadata, m, extra)
handler.help = ["umi-stalker-wastalk <nomor/tag>"]
handler.command = ["umi-stalker-wastalk", "umi-wastalk", "umi-whatsappstalk", "umi-stalkwa", "wastalk", "whatsappstalk", "stalkwa"]
handler.tags = ["stalker"]
handler.description = "Stalk profile WhatsApp"
handler.importSource = "umi"
handler.importConfig = {"name": "wastalk", "alias": ["whatsappstalk", "stalkwa"], "category": "stalker", "description": "Stalk profile WhatsApp", "usage": ".wastalk <nomor/tag>", "example": ".wastalk 6281234567890", "isGroup": false, "isBotAdmin": false, "isAdmin": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-wastalk": "wastalk", "umi-wastalk": "wastalk", "umi-whatsappstalk": "whatsappstalk", "umi-stalkwa": "stalkwa", "wastalk": "wastalk", "whatsappstalk": "whatsappstalk", "stalkwa": "stalkwa"}
export default handler
