/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cc1", "category": "colorgrade", "aliasMap": {"umi-colorgrade-cc1": "cc1", "umi-cc1": "cc1", "umi-moody1": "moody1", "umi-darkcinematic": "darkcinematic", "cc1": "cc1", "moody1": "moody1", "darkcinematic": "darkcinematic"}, "description": "Color Grading CC1 - Dark Cinematic Moody", "usage": ".cc1 (Kirim/Reply Foto)", "example": ".cc1"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/colorgrade/cc1.js", metadata, m, extra)
handler.help = ["umi-colorgrade-cc1 (Kirim/Reply Foto)"]
handler.command = ["umi-colorgrade-cc1", "umi-cc1", "umi-moody1", "umi-darkcinematic", "cc1", "moody1", "darkcinematic"]
handler.tags = ["colorgrade"]
handler.description = "Color Grading CC1 - Dark Cinematic Moody"
handler.importSource = "umi"
handler.importConfig = {"name": "cc1", "alias": ["cc1", "moody1", "darkcinematic"], "category": "colorgrade", "description": "Color Grading CC1 - Dark Cinematic Moody", "usage": ".cc1 (Kirim/Reply Foto)", "example": ".cc1", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-colorgrade-cc1": "cc1", "umi-cc1": "cc1", "umi-moody1": "moody1", "umi-darkcinematic": "darkcinematic", "cc1": "cc1", "moody1": "moody1", "darkcinematic": "darkcinematic"}
export default handler
