/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tokopedia", "category": "search", "aliasMap": {"umi-search-tokopedia": "tokopedia", "umi-tokopedia": "tokopedia", "umi-tokped": "tokped", "umi-toped": "toped", "umi-tokpedsearch": "tokpedsearch", "tokopedia": "tokopedia", "tokped": "tokped", "toped": "toped", "tokpedsearch": "tokpedsearch"}, "description": "Mencari produk di Tokopedia", "usage": ".tokopedia <kata kunci>", "example": ".tokopedia vivo x300", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/tokopedia.js", metadata, m, extra)
handler.help = ["umi-search-tokopedia <kata kunci>"]
handler.command = ["umi-search-tokopedia", "umi-tokopedia", "umi-tokped", "umi-toped", "umi-tokpedsearch", "tokopedia", "tokped", "toped", "tokpedsearch"]
handler.tags = ["search"]
handler.description = "Mencari produk di Tokopedia"
handler.importSource = "umi"
handler.importConfig = {"name": "tokopedia", "alias": ["tokped", "toped", "tokpedsearch"], "category": "search", "description": "Mencari produk di Tokopedia", "usage": ".tokopedia <kata kunci>", "example": ".tokopedia vivo x300", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-search-tokopedia": "tokopedia", "umi-tokopedia": "tokopedia", "umi-tokped": "tokped", "umi-toped": "toped", "umi-tokpedsearch": "tokpedsearch", "tokopedia": "tokopedia", "tokped": "tokped", "toped": "toped", "tokpedsearch": "tokpedsearch"}
export default handler
