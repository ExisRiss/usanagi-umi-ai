import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kalkulatormbg", "category": "tools", "aliasMap": {"umi-tools-kalkulatormbg": "kalkulatormbg", "umi-kalkulatormbg": "kalkulatormbg", "umi-kkmbg": "kkmbg"}, "description": "Hitung durasi dan perbandingan dana Makan Bergizi Gratis (MBG)", "usage": ".kkmbg <jumlah_uang>", "example": ".kkmbg 1000000000", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/kalkulatormbg.js", metadata, m, extra)
handler.help = ["umi-tools-kalkulatormbg <jumlah_uang>"]
handler.command = ["umi-tools-kalkulatormbg", "umi-kalkulatormbg", "umi-kkmbg"]
handler.tags = ["tools"]
handler.description = "Hitung durasi dan perbandingan dana Makan Bergizi Gratis (MBG)"
handler.importSource = "umi"
handler.importConfig = {"name": "kalkulatormbg", "alias": ["kkmbg"], "category": "tools", "description": "Hitung durasi dan perbandingan dana Makan Bergizi Gratis (MBG)", "usage": ".kkmbg <jumlah_uang>", "example": ".kkmbg 1000000000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-kalkulatormbg": "kalkulatormbg", "umi-kalkulatormbg": "kalkulatormbg", "umi-kkmbg": "kkmbg"}
export default handler
