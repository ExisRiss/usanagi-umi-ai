/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cc2", "category": "colorgrade", "aliasMap": {"umi-colorgrade-cc2": "cc2", "umi-cc2": "cc2", "umi-warmflash": "warmflash", "umi-vintage90s": "vintage90s", "cc2": "cc2", "warmflash": "warmflash", "vintage90s": "vintage90s"}, "description": "Color Grading CC2 - Warm Vintage Flash Tone", "usage": ".cc2 (Kirim/Reply Foto)", "example": ".cc2"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/colorgrade/cc2.js", metadata, m, extra)
handler.help = ["umi-colorgrade-cc2 (Kirim/Reply Foto)"]
handler.command = ["umi-colorgrade-cc2", "umi-cc2", "umi-warmflash", "umi-vintage90s", "cc2", "warmflash", "vintage90s"]
handler.tags = ["colorgrade"]
handler.description = "Color Grading CC2 - Warm Vintage Flash Tone"
handler.importSource = "umi"
handler.importConfig = {"name": "cc2", "alias": ["cc2", "warmflash", "vintage90s"], "category": "colorgrade", "description": "Color Grading CC2 - Warm Vintage Flash Tone", "usage": ".cc2 (Kirim/Reply Foto)", "example": ".cc2", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-colorgrade-cc2": "cc2", "umi-cc2": "cc2", "umi-warmflash": "warmflash", "umi-vintage90s": "vintage90s", "cc2": "cc2", "warmflash": "warmflash", "vintage90s": "vintage90s"}
export default handler
