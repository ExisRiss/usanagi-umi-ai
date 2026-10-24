import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "iqc3", "category": "maker", "aliasMap": {"umi-maker-iqc3": "iqc3", "umi-iqc3": "iqc3", "umi-canvasiqc3": "canvasiqc3", "umi-iqc3maker": "iqc3maker", "iqc3": "iqc3", "canvasiqc3": "canvasiqc3", "iqc3maker": "iqc3maker"}, "description": "Membuat gambar Canvas IQC dari teks", "usage": ".iqc3 <teks>", "example": ".iqc3 Tes1", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/iqc3.js", metadata, m, extra)
handler.help = ["umi-maker-iqc3 <teks>"]
handler.command = ["umi-maker-iqc3", "umi-iqc3", "umi-canvasiqc3", "umi-iqc3maker", "iqc3", "canvasiqc3", "iqc3maker"]
handler.tags = ["maker"]
handler.description = "Membuat gambar Canvas IQC dari teks"
handler.importSource = "umi"
handler.importConfig = {"name": "iqc3", "alias": ["canvasiqc3", "iqc3maker"], "category": "maker", "description": "Membuat gambar Canvas IQC dari teks", "usage": ".iqc3 <teks>", "example": ".iqc3 Tes1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-iqc3": "iqc3", "umi-iqc3": "iqc3", "umi-canvasiqc3": "canvasiqc3", "umi-iqc3maker": "iqc3maker", "iqc3": "iqc3", "canvasiqc3": "canvasiqc3", "iqc3maker": "iqc3maker"}
export default handler
