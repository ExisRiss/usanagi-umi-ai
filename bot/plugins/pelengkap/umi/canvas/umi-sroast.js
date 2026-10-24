/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sroast", "category": "canvas", "aliasMap": {"umi-canvas-sroast": "sroast", "umi-sroast": "sroast", "umi-stickerroast": "stickerroast", "sroast": "sroast", "stickerroast": "stickerroast"}, "description": "Buat stiker roast", "usage": ".sroast <teks1> | <teks2> | <teks3>", "example": ".sroast kamu | JELEK | banget", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/sroast.js", metadata, m, extra)
handler.help = ["umi-canvas-sroast <teks1> | <teks2> | <teks3>"]
handler.command = ["umi-canvas-sroast", "umi-sroast", "umi-stickerroast", "sroast", "stickerroast"]
handler.tags = ["canvas"]
handler.description = "Buat stiker roast"
handler.importSource = "umi"
handler.importConfig = {"name": "sroast", "alias": ["stickerroast", "sroast"], "category": "canvas", "description": "Buat stiker roast", "usage": ".sroast <teks1> | <teks2> | <teks3>", "example": ".sroast kamu | JELEK | banget", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-sroast": "sroast", "umi-sroast": "sroast", "umi-stickerroast": "stickerroast", "sroast": "sroast", "stickerroast": "stickerroast"}
export default handler
