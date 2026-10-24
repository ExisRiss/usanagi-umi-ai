import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "iqc2", "category": "canvas", "aliasMap": {"umi-canvas-iqc2": "iqc2", "umi-iqc2": "iqc2", "umi-qc3": "qc3", "qc3": "qc3"}, "description": "Membuat Fake Quote iOS style dengan informasi baterai dan provider.", "usage": ".iqc2 [text/reply]", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/iqc2.js", metadata, m, extra)
handler.help = ["umi-canvas-iqc2 [text/reply]"]
handler.command = ["umi-canvas-iqc2", "umi-iqc2", "umi-qc3", "qc3"]
handler.tags = ["canvas"]
handler.description = "Membuat Fake Quote iOS style dengan informasi baterai dan provider."
handler.importSource = "umi"
handler.importConfig = {"name": "iqc2", "alias": ["qc3"], "category": "canvas", "description": "Membuat Fake Quote iOS style dengan informasi baterai dan provider.", "usage": ".iqc2 [text/reply]", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-iqc2": "iqc2", "umi-iqc2": "iqc2", "umi-qc3": "qc3", "qc3": "qc3"}
export default handler
