/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "buatquotes", "category": "canvas", "aliasMap": {"umi-canvas-buatquotes": "buatquotes", "umi-buatquotes": "buatquotes", "umi-bq": "bq", "umi-quoteanime": "quoteanime", "umi-animequote": "animequote", "buatquotes": "buatquotes", "bq": "bq", "animequote": "animequote"}, "description": "Membuat gambar quote bertema anime secara custom.", "usage": ".buatquotes [id background] | <teks> | [nama pembuat]", "example": ".buatquotes 2 | Tetaplah hidup walaupun tidak berguna | Maman", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/buatquotes.js", metadata, m, extra)
handler.help = ["umi-canvas-buatquotes [id background] | <teks> | [nama pembuat]"]
handler.command = ["umi-canvas-buatquotes", "umi-buatquotes", "umi-bq", "umi-quoteanime", "umi-animequote", "buatquotes", "bq", "animequote"]
handler.tags = ["canvas"]
handler.description = "Membuat gambar quote bertema anime secara custom."
handler.importSource = "umi"
handler.importConfig = {"name": "buatquotes", "alias": ["bq", "quoteanime", "animequote"], "category": "canvas", "description": "Membuat gambar quote bertema anime secara custom.", "usage": ".buatquotes [id background] | <teks> | [nama pembuat]", "example": ".buatquotes 2 | Tetaplah hidup walaupun tidak berguna | Maman", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-buatquotes": "buatquotes", "umi-buatquotes": "buatquotes", "umi-bq": "bq", "umi-quoteanime": "quoteanime", "umi-animequote": "animequote", "buatquotes": "buatquotes", "bq": "bq", "animequote": "animequote"}
export default handler
