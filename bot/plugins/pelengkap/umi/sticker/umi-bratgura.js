/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bratgura", "category": "sticker", "aliasMap": {"umi-sticker-bratgura": "bratgura", "umi-bratgura": "bratgura", "umi-bratanimegura": "bratanimegura", "umi-bratganime": "bratganime", "bratgura": "bratgura", "bratanimegura": "bratanimegura", "bratganime": "bratganime"}, "description": "Membuat sticker anime chibi dengan teks brat style", "usage": ".bratanime4 <text>", "example": ".bratanime4 Besok cenin", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/bratgura.js", metadata, m, extra)
handler.help = ["umi-sticker-bratgura <text>"]
handler.command = ["umi-sticker-bratgura", "umi-bratgura", "umi-bratanimegura", "umi-bratganime", "bratgura", "bratanimegura", "bratganime"]
handler.tags = ["sticker"]
handler.description = "Membuat sticker anime chibi dengan teks brat style"
handler.importSource = "umi"
handler.importConfig = {"name": "bratgura", "alias": ["bratanimegura", "bratgura", "bratganime"], "category": "sticker", "description": "Membuat sticker anime chibi dengan teks brat style", "usage": ".bratanime4 <text>", "example": ".bratanime4 Besok cenin", "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-bratgura": "bratgura", "umi-bratgura": "bratgura", "umi-bratanimegura": "bratanimegura", "umi-bratganime": "bratganime", "bratgura": "bratgura", "bratanimegura": "bratanimegura", "bratganime": "bratganime"}
export default handler
