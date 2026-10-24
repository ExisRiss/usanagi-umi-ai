import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekperforma", "category": "fun", "aliasMap": {"umi-fun-cekperforma": "cekperforma", "umi-cekperforma": "cekperforma", "umi-performa": "performa", "umi-cekperf": "cekperf", "cekperforma": "cekperforma", "performa": "performa", "cekperf": "cekperf"}, "description": "Cek performa secara random (bercanda)", "usage": ".cekperforma <nama>", "example": ".cekperforma Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/cekperfoma.js", metadata, m, extra)
handler.help = ["umi-fun-cekperforma <nama>"]
handler.command = ["umi-fun-cekperforma", "umi-cekperforma", "umi-performa", "umi-cekperf", "cekperforma", "performa", "cekperf"]
handler.tags = ["fun"]
handler.description = "Cek performa secara random (bercanda)"
handler.importSource = "umi"
handler.importConfig = {"name": "cekperforma", "alias": ["performa", "cekperf"], "category": "fun", "description": "Cek performa secara random (bercanda)", "usage": ".cekperforma <nama>", "example": ".cekperforma Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-cekperforma": "cekperforma", "umi-cekperforma": "cekperforma", "umi-performa": "performa", "umi-cekperf": "cekperf", "cekperforma": "cekperforma", "performa": "performa", "cekperf": "cekperf"}
export default handler
