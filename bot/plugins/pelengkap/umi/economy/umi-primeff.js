/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "primeff", "category": "economy", "aliasMap": {"umi-economy-primeff": "primeff", "umi-primeff": "primeff", "umi-prime": "prime", "umi-kalkulatorprime": "kalkulatorprime", "umi-primefreefire": "primefreefire", "umi-ffprime": "ffprime", "primeff": "primeff", "prime": "prime", "kalkulatorprime": "kalkulatorprime", "primefreefire": "primefreefire", "ffprime": "ffprime"}, "description": "Kalkulator Prime Free Fire untuk menghitung estimasi diamond dan harga rupiah", "usage": ".primeff <jumlah poin>", "example": ".primeff 12900", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/economy/primeff.js", metadata, m, extra)
handler.help = ["umi-economy-primeff <jumlah poin>"]
handler.command = ["umi-economy-primeff", "umi-primeff", "umi-prime", "umi-kalkulatorprime", "umi-primefreefire", "umi-ffprime", "primeff", "prime", "kalkulatorprime", "primefreefire", "ffprime"]
handler.tags = ["economy"]
handler.description = "Kalkulator Prime Free Fire untuk menghitung estimasi diamond dan harga rupiah"
handler.importSource = "umi"
handler.importConfig = {"name": "primeff", "alias": ["prime", "kalkulatorprime", "primefreefire", "ffprime"], "category": "economy", "description": "Kalkulator Prime Free Fire untuk menghitung estimasi diamond dan harga rupiah", "usage": ".primeff <jumlah poin>", "example": ".primeff 12900", "isOwner": false, "isPremium": false, "cooldown": 5, "energi": 0}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-economy-primeff": "primeff", "umi-primeff": "primeff", "umi-prime": "prime", "umi-kalkulatorprime": "kalkulatorprime", "umi-primefreefire": "primefreefire", "umi-ffprime": "ffprime", "primeff": "primeff", "prime": "prime", "kalkulatorprime": "kalkulatorprime", "primefreefire": "primefreefire", "ffprime": "ffprime"}
export default handler
