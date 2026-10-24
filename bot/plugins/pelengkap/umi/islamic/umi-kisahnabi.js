import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kisahnabi", "category": "islamic", "aliasMap": {"umi-islamic-kisahnabi": "kisahnabi", "umi-kisahnabi": "kisahnabi", "umi-nabi": "nabi", "umi-storynabi": "storynabi", "umi-ceritanabi": "ceritanabi", "kisahnabi": "kisahnabi", "nabi": "nabi", "storynabi": "storynabi", "ceritanabi": "ceritanabi"}, "description": "Kisah para nabi dan rasul", "usage": ".kisahnabi <nama_nabi>", "example": ".kisahnabi muhammad", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/kisahnabi.js", metadata, m, extra)
handler.help = ["umi-islamic-kisahnabi <nama_nabi>"]
handler.command = ["umi-islamic-kisahnabi", "umi-kisahnabi", "umi-nabi", "umi-storynabi", "umi-ceritanabi", "kisahnabi", "nabi", "storynabi", "ceritanabi"]
handler.tags = ["islamic"]
handler.description = "Kisah para nabi dan rasul"
handler.importSource = "umi"
handler.importConfig = {"name": "kisahnabi", "alias": ["nabi", "storynabi", "ceritanabi"], "category": "islamic", "description": "Kisah para nabi dan rasul", "usage": ".kisahnabi <nama_nabi>", "example": ".kisahnabi muhammad", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-islamic-kisahnabi": "kisahnabi", "umi-kisahnabi": "kisahnabi", "umi-nabi": "nabi", "umi-storynabi": "storynabi", "umi-ceritanabi": "ceritanabi", "kisahnabi": "kisahnabi", "nabi": "nabi", "storynabi": "storynabi", "ceritanabi": "ceritanabi"}
export default handler
