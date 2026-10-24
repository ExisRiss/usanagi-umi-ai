import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "seleksif02", "category": "main", "aliasMap": {"umi-main-seleksif02": "seleksif02", "umi-seleksif02": "seleksif02", "umi-f02": "f02", "umi-joinf02": "joinf02", "seleksif02": "seleksif02", "f02": "f02", "joinf02": "joinf02"}, "description": "Seleksi masuk F02", "usage": ".seleksif02", "example": ".seleksif02", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/seleksi.js", metadata, m, extra)
handler.help = ["umi-main-seleksif02"]
handler.command = ["umi-main-seleksif02", "umi-seleksif02", "umi-f02", "umi-joinf02", "seleksif02", "f02", "joinf02"]
handler.tags = ["main"]
handler.description = "Seleksi masuk F02"
handler.importSource = "umi"
handler.importConfig = {"name": "seleksif02", "alias": ["f02", "joinf02"], "category": "main", "description": "Seleksi masuk F02", "usage": ".seleksif02", "example": ".seleksif02", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-main-seleksif02": "seleksif02", "umi-seleksif02": "seleksif02", "umi-f02": "f02", "umi-joinf02": "joinf02", "seleksif02": "seleksif02", "f02": "f02", "joinf02": "joinf02"}
export default handler
