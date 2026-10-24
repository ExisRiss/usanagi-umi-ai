import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "quotefilsuf", "category": "quotes", "aliasMap": {"umi-quotes-quotefilsuf": "quotefilsuf", "umi-quotefilsuf": "quotefilsuf", "umi-katafilsuf": "katafilsuf", "umi-filsuf": "filsuf", "umi-quotesfilsuf": "quotesfilsuf", "umi-filsafat": "filsafat", "quotefilsuf": "quotefilsuf", "katafilsuf": "katafilsuf", "filsuf": "filsuf", "quotesfilsuf": "quotesfilsuf", "filsafat": "filsafat"}, "description": "Mendapatkan kata-kata bijak / quote acak dari filsuf terkenal", "usage": ".quotefilsuf", "example": ".quotefilsuf", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/quotes/quotefilsuf.js", metadata, m, extra)
handler.help = ["umi-quotes-quotefilsuf"]
handler.command = ["umi-quotes-quotefilsuf", "umi-quotefilsuf", "umi-katafilsuf", "umi-filsuf", "umi-quotesfilsuf", "umi-filsafat", "quotefilsuf", "katafilsuf", "filsuf", "quotesfilsuf", "filsafat"]
handler.tags = ["quotes"]
handler.description = "Mendapatkan kata-kata bijak / quote acak dari filsuf terkenal"
handler.importSource = "umi"
handler.importConfig = {"name": "quotefilsuf", "alias": ["katafilsuf", "filsuf", "quotesfilsuf", "filsafat"], "category": "quotes", "description": "Mendapatkan kata-kata bijak / quote acak dari filsuf terkenal", "usage": ".quotefilsuf", "example": ".quotefilsuf", "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-quotes-quotefilsuf": "quotefilsuf", "umi-quotefilsuf": "quotefilsuf", "umi-katafilsuf": "katafilsuf", "umi-filsuf": "filsuf", "umi-quotesfilsuf": "quotesfilsuf", "umi-filsafat": "filsafat", "quotefilsuf": "quotefilsuf", "katafilsuf": "katafilsuf", "filsuf": "filsuf", "quotesfilsuf": "quotesfilsuf", "filsafat": "filsafat"}
export default handler
