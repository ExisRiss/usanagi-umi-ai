import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "quotecard", "category": "maker", "aliasMap": {"umi-maker-quotecard": "quotecard", "umi-quotecard": "quotecard", "umi-qcard": "qcard", "umi-cardquote": "cardquote", "umi-makerquote": "makerquote", "quotecard": "quotecard", "qcard": "qcard", "cardquote": "cardquote", "makerquote": "makerquote"}, "description": "Generate quote card dengan background gradient dan tipografi elegan", "usage": ".quotecard teks|author", "example": ".quotecard Jangan ragu menggapai bintang|@AlwaysCodex", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/quotecard.js", metadata, m, extra)
handler.help = ["umi-maker-quotecard teks|author"]
handler.command = ["umi-maker-quotecard", "umi-quotecard", "umi-qcard", "umi-cardquote", "umi-makerquote", "quotecard", "qcard", "cardquote", "makerquote"]
handler.tags = ["maker"]
handler.description = "Generate quote card dengan background gradient dan tipografi elegan"
handler.importSource = "umi"
handler.importConfig = {"name": "quotecard", "alias": ["qcard", "cardquote", "makerquote"], "category": "maker", "description": "Generate quote card dengan background gradient dan tipografi elegan", "usage": ".quotecard teks|author", "example": ".quotecard Jangan ragu menggapai bintang|@AlwaysCodex", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-maker-quotecard": "quotecard", "umi-quotecard": "quotecard", "umi-qcard": "qcard", "umi-cardquote": "cardquote", "umi-makerquote": "makerquote", "quotecard": "quotecard", "qcard": "qcard", "cardquote": "cardquote", "makerquote": "makerquote"}
export default handler
