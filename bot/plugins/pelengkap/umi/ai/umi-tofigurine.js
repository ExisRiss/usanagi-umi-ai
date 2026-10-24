import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tofigure3", "category": "ai", "aliasMap": {"umi-ai-tofigure3": "tofigure3", "umi-tofigure3": "tofigure3", "umi-figurine3": "figurine3", "umi-bandai3": "bandai3", "umi-actionfigure3": "actionfigure3", "tofigure3": "tofigure3", "figurine3": "figurine3", "bandai3": "bandai3", "actionfigure3": "actionfigure3"}, "description": "Ubah foto menjadi action figure/figurine koleksi", "usage": ".tofigure3 (reply/kirim gambar)", "example": ".tofigure3", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/tofigurine.js", metadata, m, extra)
handler.help = ["umi-ai-tofigure3 (reply/kirim gambar)"]
handler.command = ["umi-ai-tofigure3", "umi-tofigure3", "umi-figurine3", "umi-bandai3", "umi-actionfigure3", "tofigure3", "figurine3", "bandai3", "actionfigure3"]
handler.tags = ["ai"]
handler.description = "Ubah foto menjadi action figure/figurine koleksi"
handler.importSource = "umi"
handler.importConfig = {"name": "tofigure3", "alias": ["figurine3", "tofigure3", "bandai3", "actionfigure3"], "category": "ai", "description": "Ubah foto menjadi action figure/figurine koleksi", "usage": ".tofigure3 (reply/kirim gambar)", "example": ".tofigure3", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-tofigure3": "tofigure3", "umi-tofigure3": "tofigure3", "umi-figurine3": "figurine3", "umi-bandai3": "bandai3", "umi-actionfigure3": "actionfigure3", "tofigure3": "tofigure3", "figurine3": "figurine3", "bandai3": "bandai3", "actionfigure3": "actionfigure3"}
export default handler
