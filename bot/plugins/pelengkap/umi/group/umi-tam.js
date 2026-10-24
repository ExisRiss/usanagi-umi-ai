import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tam", "category": "group", "aliasMap": {"umi-group-tam": "tam", "umi-tam": "tam", "umi-topactive": "topactive", "umi-topmember": "topmember", "tam": "tam", "topactive": "topactive", "topmember": "topmember"}, "description": "Lihat top member paling aktif di grup", "usage": ".tam <jumlah>", "example": ".tam 10", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/tam.js", metadata, m, extra)
handler.help = ["umi-group-tam <jumlah>"]
handler.command = ["umi-group-tam", "umi-tam", "umi-topactive", "umi-topmember", "tam", "topactive", "topmember"]
handler.tags = ["group"]
handler.description = "Lihat top member paling aktif di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "tam", "alias": ["topactive", "topmember"], "category": "group", "description": "Lihat top member paling aktif di grup", "usage": ".tam <jumlah>", "example": ".tam 10", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-tam": "tam", "umi-tam": "tam", "umi-topactive": "topactive", "umi-topmember": "topmember", "tam": "tam", "topactive": "topactive", "topmember": "topmember"}
export default handler
