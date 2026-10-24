/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "iqc", "category": "canvas", "aliasMap": {"umi-canvas-iqc": "iqc", "umi-iqc": "iqc", "umi-qc2": "qc2", "qc2": "qc2"}, "description": "Membuat Fake Quote iOS style secara instan.", "usage": ".iqc [text/reply]", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/iqc.js", metadata, m, extra)
handler.help = ["umi-canvas-iqc [text/reply]"]
handler.command = ["umi-canvas-iqc", "umi-iqc", "umi-qc2", "qc2"]
handler.tags = ["canvas"]
handler.description = "Membuat Fake Quote iOS style secara instan."
handler.importSource = "umi"
handler.importConfig = {"name": "iqc", "alias": ["qc2"], "category": "canvas", "description": "Membuat Fake Quote iOS style secara instan.", "usage": ".iqc [text/reply]", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-iqc": "iqc", "umi-iqc": "iqc", "umi-qc2": "qc2", "qc2": "qc2"}
export default handler
