import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "carigrup", "category": "search", "aliasMap": {"umi-search-carigrup": "carigrup", "umi-carigrup": "carigrup", "umi-searchgrup": "searchgrup", "umi-findgrup": "findgrup", "umi-grupwa": "grupwa", "carigrup": "carigrup", "searchgrup": "searchgrup", "findgrup": "findgrup", "grupwa": "grupwa"}, "description": "Cari grup WhatsApp berdasarkan keyword", "usage": ".carigrup <keyword>", "example": ".carigrup gb isian", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/carigrup.js", metadata, m, extra)
handler.help = ["umi-search-carigrup <keyword>"]
handler.command = ["umi-search-carigrup", "umi-carigrup", "umi-searchgrup", "umi-findgrup", "umi-grupwa", "carigrup", "searchgrup", "findgrup", "grupwa"]
handler.tags = ["search"]
handler.description = "Cari grup WhatsApp berdasarkan keyword"
handler.importSource = "umi"
handler.importConfig = {"name": "carigrup", "alias": ["searchgrup", "findgrup", "grupwa"], "category": "search", "description": "Cari grup WhatsApp berdasarkan keyword", "usage": ".carigrup <keyword>", "example": ".carigrup gb isian", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-carigrup": "carigrup", "umi-carigrup": "carigrup", "umi-searchgrup": "searchgrup", "umi-findgrup": "findgrup", "umi-grupwa": "grupwa", "carigrup": "carigrup", "searchgrup": "searchgrup", "findgrup": "findgrup", "grupwa": "grupwa"}
export default handler
