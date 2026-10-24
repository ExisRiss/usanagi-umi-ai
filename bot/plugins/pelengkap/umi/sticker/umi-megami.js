import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ryo", "category": "sticker", "aliasMap": {"umi-sticker-ryo": "ryo", "umi-ryo": "ryo", "ryo": "ryo"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/megami.js", metadata, m, extra)
handler.help = ["umi-sticker-ryo"]
handler.command = ["umi-sticker-ryo", "umi-ryo", "ryo"]
handler.tags = ["sticker"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "ryo", "alias": [], "category": "sticker", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-sticker-ryo": "ryo", "umi-ryo": "ryo", "ryo": "ryo"}
export default handler
