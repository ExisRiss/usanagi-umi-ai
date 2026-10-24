import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "myip", "category": "tools", "aliasMap": {"umi-tools-myip": "myip", "umi-myip": "myip", "umi-botip": "botip", "umi-publicip": "publicip", "myip": "myip", "botip": "botip", "publicip": "publicip"}, "description": "Cek IP publik server bot", "usage": ".myip", "example": ".myip", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/myip.js", metadata, m, extra)
handler.help = ["umi-tools-myip"]
handler.command = ["umi-tools-myip", "umi-myip", "umi-botip", "umi-publicip", "myip", "botip", "publicip"]
handler.tags = ["tools"]
handler.description = "Cek IP publik server bot"
handler.importSource = "umi"
handler.importConfig = {"name": "myip", "alias": ["botip", "publicip"], "category": "tools", "description": "Cek IP publik server bot", "usage": ".myip", "example": ".myip", "isOwner": true, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-myip": "myip", "umi-myip": "myip", "umi-botip": "botip", "umi-publicip": "publicip", "myip": "myip", "botip": "botip", "publicip": "publicip"}
export default handler
