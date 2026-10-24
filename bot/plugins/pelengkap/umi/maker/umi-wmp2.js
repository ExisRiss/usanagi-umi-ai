/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "wmp2", "category": "maker", "aliasMap": {"umi-maker-wmp2": "wmp2", "umi-wmp2": "wmp2", "umi-canvaswmp2": "canvaswmp2", "umi-wmpmeme": "wmpmeme", "wmp2": "wmp2", "canvaswmp2": "canvaswmp2", "wmpmeme": "wmpmeme"}, "description": "Membuat gambar Canvas WMP2 dengan teks custom", "usage": ".wmp2 <teks1|teks2|teks3|teks4>", "example": ".wmp2 ngapain cemburu|kan|cuman sebatas|teman", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/wmp2.js", metadata, m, extra)
handler.help = ["umi-maker-wmp2 <teks1|teks2|teks3|teks4>"]
handler.command = ["umi-maker-wmp2", "umi-wmp2", "umi-canvaswmp2", "umi-wmpmeme", "wmp2", "canvaswmp2", "wmpmeme"]
handler.tags = ["maker"]
handler.description = "Membuat gambar Canvas WMP2 dengan teks custom"
handler.importSource = "umi"
handler.importConfig = {"name": "wmp2", "alias": ["canvaswmp2", "wmpmeme"], "category": "maker", "description": "Membuat gambar Canvas WMP2 dengan teks custom", "usage": ".wmp2 <teks1|teks2|teks3|teks4>", "example": ".wmp2 ngapain cemburu|kan|cuman sebatas|teman", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-wmp2": "wmp2", "umi-wmp2": "wmp2", "umi-canvaswmp2": "canvaswmp2", "umi-wmpmeme": "wmpmeme", "wmp2": "wmp2", "canvaswmp2": "canvaswmp2", "wmpmeme": "wmpmeme"}
export default handler
