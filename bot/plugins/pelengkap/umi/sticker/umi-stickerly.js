/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stickerly", "category": "sticker", "aliasMap": {"umi-sticker-stickerly": "stickerly", "umi-stickerly": "stickerly", "umi-stikerly": "stikerly", "umi-stickerlysearch": "stickerlysearch", "stikerly": "stikerly", "stickerlysearch": "stickerlysearch"}, "description": "Cari dan download sticker pack dari Sticker.ly", "usage": ".stickerly <query / url>", "example": ".stickerly anime", "cooldown": 10, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/stickerly.js", metadata, m, extra)
handler.help = ["umi-sticker-stickerly <query / url>"]
handler.command = ["umi-sticker-stickerly", "umi-stickerly", "umi-stikerly", "umi-stickerlysearch", "stikerly", "stickerlysearch"]
handler.tags = ["sticker"]
handler.description = "Cari dan download sticker pack dari Sticker.ly"
handler.importSource = "umi"
handler.importConfig = {"name": "stickerly", "alias": ["stikerly", "stickerlysearch"], "category": "sticker", "description": "Cari dan download sticker pack dari Sticker.ly", "usage": ".stickerly <query / url>", "example": ".stickerly anime", "cooldown": 10, "energi": 2}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-stickerly": "stickerly", "umi-stickerly": "stickerly", "umi-stikerly": "stikerly", "umi-stickerlysearch": "stickerlysearch", "stikerly": "stikerly", "stickerlysearch": "stickerlysearch"}
export default handler
