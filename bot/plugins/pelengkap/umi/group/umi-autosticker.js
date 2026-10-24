/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "autosticker", "category": "group", "aliasMap": {"umi-group-autosticker": "autosticker", "umi-autosticker": "autosticker", "umi-autostiker": "autostiker", "autosticker": "autosticker", "autostiker": "autostiker"}, "description": "Toggle auto sticker - otomatis jadikan gambar/video jadi sticker", "usage": ".autosticker on/off", "example": ".autosticker on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/autosticker.js", metadata, m, extra)
handler.help = ["umi-group-autosticker on/off"]
handler.command = ["umi-group-autosticker", "umi-autosticker", "umi-autostiker", "autosticker", "autostiker"]
handler.tags = ["group"]
handler.description = "Toggle auto sticker - otomatis jadikan gambar/video jadi sticker"
handler.importSource = "umi"
handler.importConfig = {"name": "autosticker", "alias": ["autostiker", "as"], "category": "group", "description": "Toggle auto sticker - otomatis jadikan gambar/video jadi sticker", "usage": ".autosticker on/off", "example": ".autosticker on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-autosticker": "autosticker", "umi-autosticker": "autosticker", "umi-autostiker": "autostiker", "autosticker": "autosticker", "autostiker": "autostiker"}
export default handler
