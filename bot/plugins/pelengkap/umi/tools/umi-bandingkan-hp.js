import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bandingkan-hp", "category": "tools", "aliasMap": {"umi-tools-bandingkan-hp": "bandingkan-hp", "umi-bandingkan-hp": "bandingkan-hp", "umi-bandingkanhp": "bandingkanhp", "umi-comparehp": "comparehp", "bandingkan-hp": "bandingkan-hp", "bandingkanhp": "bandingkanhp", "comparehp": "comparehp"}, "description": "Membandingkan dua spesifikasi smartphone dari Carisinyal.", "usage": ".bandingkan-hp <hp1> | <hp2>", "example": ".bandingkan-hp oppo a3s | vivo y91", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/bandingkan-hp.js", metadata, m, extra)
handler.help = ["umi-tools-bandingkan-hp <hp1> | <hp2>"]
handler.command = ["umi-tools-bandingkan-hp", "umi-bandingkan-hp", "umi-bandingkanhp", "umi-comparehp", "bandingkan-hp", "bandingkanhp", "comparehp"]
handler.tags = ["tools"]
handler.description = "Membandingkan dua spesifikasi smartphone dari Carisinyal."
handler.importSource = "umi"
handler.importConfig = {"name": "bandingkan-hp", "alias": ["bandingkanhp", "comparehp"], "category": "tools", "description": "Membandingkan dua spesifikasi smartphone dari Carisinyal.", "usage": ".bandingkan-hp <hp1> | <hp2>", "example": ".bandingkan-hp oppo a3s | vivo y91", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-bandingkan-hp": "bandingkan-hp", "umi-bandingkan-hp": "bandingkan-hp", "umi-bandingkanhp": "bandingkanhp", "umi-comparehp": "comparehp", "bandingkan-hp": "bandingkan-hp", "bandingkanhp": "bandingkanhp", "comparehp": "comparehp"}
export default handler
