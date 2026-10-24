/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "uhdpaper", "category": "image", "aliasMap": {"umi-image-uhdpaper": "uhdpaper", "umi-uhdpaper": "uhdpaper", "uhdpaper": "uhdpaper"}, "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/image/uhdpaper.js", metadata, m, extra)
handler.help = ["umi-image-uhdpaper"]
handler.command = ["umi-image-uhdpaper", "umi-uhdpaper", "uhdpaper"]
handler.tags = ["image"]
handler.description = "Imported from Umi MD V4.6"
handler.importSource = "umi"
handler.importConfig = {"name": "uhdpaper", "alias": [], "category": "image", "description": "Imported from Umi MD V4.6", "usage": "", "example": "", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-image-uhdpaper": "uhdpaper", "umi-uhdpaper": "uhdpaper", "uhdpaper": "uhdpaper"}
export default handler
