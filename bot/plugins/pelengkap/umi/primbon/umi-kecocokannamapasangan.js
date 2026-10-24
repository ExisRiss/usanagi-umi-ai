import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kecocokannamapasangan", "category": "primbon", "aliasMap": {"umi-primbon-kecocokannamapasangan": "kecocokannamapasangan", "umi-kecocokannamapasangan": "kecocokannamapasangan", "umi-cocoknama": "cocoknama", "umi-matchname": "matchname", "kecocokannamapasangan": "kecocokannamapasangan", "cocoknama": "cocoknama", "matchname": "matchname"}, "description": "Cek kecocokan nama pasangan", "usage": ".kecocokannamapasangan <nama1> <nama2>", "example": ".kecocokannamapasangan putu keyla", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/primbon/kecocokannamapasangan.js", metadata, m, extra)
handler.help = ["umi-primbon-kecocokannamapasangan <nama1> <nama2>"]
handler.command = ["umi-primbon-kecocokannamapasangan", "umi-kecocokannamapasangan", "umi-cocoknama", "umi-matchname", "kecocokannamapasangan", "cocoknama", "matchname"]
handler.tags = ["primbon"]
handler.description = "Cek kecocokan nama pasangan"
handler.importSource = "umi"
handler.importConfig = {"name": "kecocokannamapasangan", "alias": ["cocoknama", "matchname"], "category": "primbon", "description": "Cek kecocokan nama pasangan", "usage": ".kecocokannamapasangan <nama1> <nama2>", "example": ".kecocokannamapasangan putu keyla", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-primbon-kecocokannamapasangan": "kecocokannamapasangan", "umi-kecocokannamapasangan": "kecocokannamapasangan", "umi-cocoknama": "cocoknama", "umi-matchname": "matchname", "kecocokannamapasangan": "kecocokannamapasangan", "cocoknama": "cocoknama", "matchname": "matchname"}
export default handler
