import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cc3", "category": "colorgrade", "aliasMap": {"umi-colorgrade-cc3": "cc3", "umi-cc3": "cc3", "umi-cyberpunk": "cyberpunk", "umi-neoncity": "neoncity", "cc3": "cc3", "cyberpunk": "cyberpunk", "neoncity": "neoncity"}, "description": "Color Grading CC3 - Cyberpunk Neon Blue Pink", "usage": ".cc3 (Kirim/Reply Foto)", "example": ".cc3"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/colorgrade/cc3.js", metadata, m, extra)
handler.help = ["umi-colorgrade-cc3 (Kirim/Reply Foto)"]
handler.command = ["umi-colorgrade-cc3", "umi-cc3", "umi-cyberpunk", "umi-neoncity", "cc3", "cyberpunk", "neoncity"]
handler.tags = ["colorgrade"]
handler.description = "Color Grading CC3 - Cyberpunk Neon Blue Pink"
handler.importSource = "umi"
handler.importConfig = {"name": "cc3", "alias": ["cc3", "cyberpunk", "neoncity"], "category": "colorgrade", "description": "Color Grading CC3 - Cyberpunk Neon Blue Pink", "usage": ".cc3 (Kirim/Reply Foto)", "example": ".cc3", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-colorgrade-cc3": "cc3", "umi-cc3": "cc3", "umi-cyberpunk": "cyberpunk", "umi-neoncity": "neoncity", "cc3": "cc3", "cyberpunk": "cyberpunk", "neoncity": "neoncity"}
export default handler
