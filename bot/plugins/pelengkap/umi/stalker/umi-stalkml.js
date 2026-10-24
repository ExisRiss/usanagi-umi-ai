import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "stalkml", "category": "stalker", "aliasMap": {"umi-stalker-stalkml": "stalkml", "umi-stalkml": "stalkml", "umi-mlstalk": "mlstalk", "umi-ceknickml": "ceknickml", "umi-nickml": "nickml", "stalkml": "stalkml", "mlstalk": "mlstalk", "ceknickml": "ceknickml", "nickml": "nickml"}, "description": "Mengetahui nama/nickname akun Mobile Legends berdasarkan ID dan Server.", "usage": ".stalkml <id> | <server>", "example": ".stalkml 1264042367 | 15139", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/stalker/stalkml.js", metadata, m, extra)
handler.help = ["umi-stalker-stalkml <id> | <server>"]
handler.command = ["umi-stalker-stalkml", "umi-stalkml", "umi-mlstalk", "umi-ceknickml", "umi-nickml", "stalkml", "mlstalk", "ceknickml", "nickml"]
handler.tags = ["stalker"]
handler.description = "Mengetahui nama/nickname akun Mobile Legends berdasarkan ID dan Server."
handler.importSource = "umi"
handler.importConfig = {"name": "stalkml", "alias": ["mlstalk", "ceknickml", "nickml"], "category": "stalker", "description": "Mengetahui nama/nickname akun Mobile Legends berdasarkan ID dan Server.", "usage": ".stalkml <id> | <server>", "example": ".stalkml 1264042367 | 15139", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-stalker-stalkml": "stalkml", "umi-stalkml": "stalkml", "umi-mlstalk": "mlstalk", "umi-ceknickml": "ceknickml", "umi-nickml": "nickml", "stalkml": "stalkml", "mlstalk": "mlstalk", "ceknickml": "ceknickml", "nickml": "nickml"}
export default handler
