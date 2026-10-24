import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "iqc4", "category": "maker", "aliasMap": {"umi-maker-iqc4": "iqc4", "umi-iqc4": "iqc4", "umi-canvasiqc4": "canvasiqc4", "umi-iqcv2": "iqcv2", "iqc4": "iqc4", "canvasiqc4": "canvasiqc4"}, "description": "Generate gambar IQC v2 (WA Reaction) dengan teks otomatis", "usage": ".iqc4 <teks>", "example": ".iqc4 Tes", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/iqc4.js", metadata, m, extra)
handler.help = ["umi-maker-iqc4 <teks>"]
handler.command = ["umi-maker-iqc4", "umi-iqc4", "umi-canvasiqc4", "umi-iqcv2", "iqc4", "canvasiqc4"]
handler.tags = ["maker"]
handler.description = "Generate gambar IQC v2 (WA Reaction) dengan teks otomatis"
handler.importSource = "umi"
handler.importConfig = {"name": "iqc4", "alias": ["canvasiqc4", "iqcv2"], "category": "maker", "description": "Generate gambar IQC v2 (WA Reaction) dengan teks otomatis", "usage": ".iqc4 <teks>", "example": ".iqc4 Tes", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-iqc4": "iqc4", "umi-iqc4": "iqc4", "umi-canvasiqc4": "canvasiqc4", "umi-iqcv2": "iqcv2", "iqc4": "iqc4", "canvasiqc4": "canvasiqc4"}
export default handler
