/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "quotetokoh", "category": "quotes", "aliasMap": {"umi-quotes-quotetokoh": "quotetokoh", "umi-quotetokoh": "quotetokoh", "umi-katatokoh": "katatokoh", "umi-quotes": "quotes", "umi-quotestokoh": "quotestokoh", "umi-katabijak": "katabijak", "quotetokoh": "quotetokoh", "katatokoh": "katatokoh", "quotes": "quotes", "quotestokoh": "quotestokoh", "katabijak": "katabijak"}, "description": "Mendapatkan kata-kata bijak / quote acak dari tokoh terkenal", "usage": ".quotetokoh", "example": ".quotetokoh", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/quotes/quotetokoh.js", metadata, m, extra)
handler.help = ["umi-quotes-quotetokoh"]
handler.command = ["umi-quotes-quotetokoh", "umi-quotetokoh", "umi-katatokoh", "umi-quotes", "umi-quotestokoh", "umi-katabijak", "quotetokoh", "katatokoh", "quotes", "quotestokoh", "katabijak"]
handler.tags = ["quotes"]
handler.description = "Mendapatkan kata-kata bijak / quote acak dari tokoh terkenal"
handler.importSource = "umi"
handler.importConfig = {"name": "quotetokoh", "alias": ["katatokoh", "quotes", "quotestokoh", "katabijak"], "category": "quotes", "description": "Mendapatkan kata-kata bijak / quote acak dari tokoh terkenal", "usage": ".quotetokoh", "example": ".quotetokoh", "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-quotes-quotetokoh": "quotetokoh", "umi-quotetokoh": "quotetokoh", "umi-katatokoh": "katatokoh", "umi-quotes": "quotes", "umi-quotestokoh": "quotestokoh", "umi-katabijak": "katabijak", "quotetokoh": "quotetokoh", "katatokoh": "katatokoh", "quotes": "quotes", "quotestokoh": "quotestokoh", "katabijak": "katabijak"}
export default handler
