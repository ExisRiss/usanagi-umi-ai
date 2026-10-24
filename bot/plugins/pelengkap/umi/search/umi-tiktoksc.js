/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tiktoksc", "category": "search", "aliasMap": {"umi-search-tiktoksc": "tiktoksc", "umi-tiktoksc": "tiktoksc", "umi-searchtt": "searchtt", "umi-tthtml": "tthtml", "tiktoksc": "tiktoksc", "searchtt": "searchtt", "tthtml": "tthtml"}, "description": "TikTok HTML Feed Airich — video vertikal langsung di WhatsApp", "usage": ".tiktoksc <kata kunci>", "example": ".tiktoksc kucing lucu", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/tiktoksc.js", metadata, m, extra)
handler.help = ["umi-search-tiktoksc <kata kunci>"]
handler.command = ["umi-search-tiktoksc", "umi-tiktoksc", "umi-searchtt", "umi-tthtml", "tiktoksc", "searchtt", "tthtml"]
handler.tags = ["search"]
handler.description = "TikTok HTML Feed Airich — video vertikal langsung di WhatsApp"
handler.importSource = "umi"
handler.importConfig = {"name": "tiktoksc", "alias": ["searchtt", "tthtml"], "category": "search", "description": "TikTok HTML Feed Airich — video vertikal langsung di WhatsApp", "usage": ".tiktoksc <kata kunci>", "example": ".tiktoksc kucing lucu", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-tiktoksc": "tiktoksc", "umi-tiktoksc": "tiktoksc", "umi-searchtt": "searchtt", "umi-tthtml": "tthtml", "tiktoksc": "tiktoksc", "searchtt": "searchtt", "tthtml": "tthtml"}
export default handler
