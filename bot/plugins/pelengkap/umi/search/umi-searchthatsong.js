/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "searchthatsong", "category": "search", "aliasMap": {"umi-search-searchthatsong": "searchthatsong", "umi-searchthatsong": "searchthatsong", "umi-sts": "sts", "umi-carilagu": "carilagu", "searchthatsong": "searchthatsong", "sts": "sts", "carilagu": "carilagu"}, "description": "Mencari detail sebuah lagu dari lirik atau potongan kata", "usage": ".searchthatsong <potongan lirik>", "example": ".searchthatsong ku menangis membayangkan", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/searchthatsong.js", metadata, m, extra)
handler.help = ["umi-search-searchthatsong <potongan lirik>"]
handler.command = ["umi-search-searchthatsong", "umi-searchthatsong", "umi-sts", "umi-carilagu", "searchthatsong", "sts", "carilagu"]
handler.tags = ["search"]
handler.description = "Mencari detail sebuah lagu dari lirik atau potongan kata"
handler.importSource = "umi"
handler.importConfig = {"name": "searchthatsong", "alias": ["sts", "carilagu"], "category": "search", "description": "Mencari detail sebuah lagu dari lirik atau potongan kata", "usage": ".searchthatsong <potongan lirik>", "example": ".searchthatsong ku menangis membayangkan", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-searchthatsong": "searchthatsong", "umi-searchthatsong": "searchthatsong", "umi-sts": "sts", "umi-carilagu": "carilagu", "searchthatsong": "searchthatsong", "sts": "sts", "carilagu": "carilagu"}
export default handler
