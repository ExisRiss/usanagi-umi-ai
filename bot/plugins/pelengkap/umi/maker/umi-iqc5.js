/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "iqc5", "category": "canvas", "aliasMap": {"umi-canvas-iqc5": "iqc5", "umi-iqc5": "iqc5", "umi-qc5": "qc5", "iqc5": "iqc5", "qc5": "qc5"}, "description": "Membuat Fake Quote iOS style tanpa API eksternal.", "usage": ".iqc5 [text/reply]", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/iqc5.js", metadata, m, extra)
handler.help = ["umi-canvas-iqc5 [text/reply]"]
handler.command = ["umi-canvas-iqc5", "umi-iqc5", "umi-qc5", "iqc5", "qc5"]
handler.tags = ["canvas"]
handler.description = "Membuat Fake Quote iOS style tanpa API eksternal."
handler.importSource = "umi"
handler.importConfig = {"name": "iqc5", "alias": ["qc5"], "category": "canvas", "description": "Membuat Fake Quote iOS style tanpa API eksternal.", "usage": ".iqc5 [text/reply]", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-iqc5": "iqc5", "umi-iqc5": "iqc5", "umi-qc5": "qc5", "iqc5": "iqc5", "qc5": "qc5"}
export default handler
