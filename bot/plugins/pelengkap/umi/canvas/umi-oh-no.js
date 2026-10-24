/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "oh-no", "category": "canvas", "aliasMap": {"umi-canvas-oh-no": "oh-no", "umi-oh-no": "oh-no", "umi-ohno": "ohno", "umi-ohnomeme": "ohnomeme", "oh-no": "oh-no", "ohno": "ohno", "ohnomeme": "ohnomeme"}, "description": "Membuat meme oh no", "usage": ".oh-no <teks>", "example": ".oh-no Aku lupa ngerjain PR", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/oh-no.js", metadata, m, extra)
handler.help = ["umi-canvas-oh-no <teks>"]
handler.command = ["umi-canvas-oh-no", "umi-oh-no", "umi-ohno", "umi-ohnomeme", "oh-no", "ohno", "ohnomeme"]
handler.tags = ["canvas"]
handler.description = "Membuat meme oh no"
handler.importSource = "umi"
handler.importConfig = {"name": "oh-no", "alias": ["ohno", "ohnomeme"], "category": "canvas", "description": "Membuat meme oh no", "usage": ".oh-no <teks>", "example": ".oh-no Aku lupa ngerjain PR", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-oh-no": "oh-no", "umi-oh-no": "oh-no", "umi-ohno": "ohno", "umi-ohnomeme": "ohnomeme", "oh-no": "oh-no", "ohno": "ohno", "ohnomeme": "ohnomeme"}
export default handler
