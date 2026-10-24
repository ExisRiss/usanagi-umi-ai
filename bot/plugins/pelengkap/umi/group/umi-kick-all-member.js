import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kickall", "category": "group", "aliasMap": {"umi-group-kickall": "kickall", "umi-kickall": "kickall", "umi-kicksemua": "kicksemua", "umi-cleargrup": "cleargrup", "kickall": "kickall", "kicksemua": "kicksemua", "cleargrup": "cleargrup"}, "description": "Kick semua member (non-admin)", "usage": ".kickall member", "example": ".kickall member", "cooldown": 10}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/kick-all-member.js", metadata, m, extra)
handler.help = ["umi-group-kickall member"]
handler.command = ["umi-group-kickall", "umi-kickall", "umi-kicksemua", "umi-cleargrup", "kickall", "kicksemua", "cleargrup"]
handler.tags = ["group"]
handler.description = "Kick semua member (non-admin)"
handler.importSource = "umi"
handler.importConfig = {"name": "kickall", "alias": ["kicksemua", "cleargrup"], "category": "group", "description": "Kick semua member (non-admin)", "usage": ".kickall member", "example": ".kickall member", "isGroup": true, "isAdmin": true, "isBotAdmin": true, "cooldown": 10, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-kickall": "kickall", "umi-kickall": "kickall", "umi-kicksemua": "kicksemua", "umi-cleargrup": "cleargrup", "kickall": "kickall", "kicksemua": "kicksemua", "cleargrup": "cleargrup"}
export default handler
