import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "imagetoasci", "category": "tools", "aliasMap": {"umi-tools-imagetoasci": "imagetoasci", "umi-imagetoasci": "imagetoasci", "umi-imgascii": "imgascii", "umi-ascii": "ascii", "imagetoasci": "imagetoasci", "imgascii": "imgascii", "ascii": "ascii"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ascii.js", metadata, m, extra)
handler.help = ["umi-tools-imagetoasci"]
handler.command = ["umi-tools-imagetoasci", "umi-imagetoasci", "umi-imgascii", "umi-ascii", "imagetoasci", "imgascii", "ascii"]
handler.tags = ["tools"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "imagetoasci", "alias": ["imgascii", "ascii"], "category": "tools", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-imagetoasci": "imagetoasci", "umi-imagetoasci": "imagetoasci", "umi-imgascii": "imgascii", "umi-ascii": "ascii", "imagetoasci": "imagetoasci", "imgascii": "imgascii", "ascii": "ascii"}
export default handler
