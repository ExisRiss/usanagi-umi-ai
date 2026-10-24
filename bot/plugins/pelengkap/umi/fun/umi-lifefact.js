/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "lifefact", "category": "fun", "aliasMap": {"umi-fun-lifefact": "lifefact", "umi-lifefact": "lifefact", "umi-funfacthidup": "funfacthidup", "umi-livefunfact": "livefunfact", "lifefact": "lifefact", "funfacthidup": "funfacthidup", "livefunfact": "livefunfact"}, "description": "Fakta statistik kehidupan berdasarkan tanggal lahir", "usage": ".lifefact YYYY-MM-DD", "example": ".lifefact 2002-01-11", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/lifefact.js", metadata, m, extra)
handler.help = ["umi-fun-lifefact YYYY-MM-DD"]
handler.command = ["umi-fun-lifefact", "umi-lifefact", "umi-funfacthidup", "umi-livefunfact", "lifefact", "funfacthidup", "livefunfact"]
handler.tags = ["fun"]
handler.description = "Fakta statistik kehidupan berdasarkan tanggal lahir"
handler.importSource = "umi"
handler.importConfig = {"name": "lifefact", "alias": ["funfacthidup", "livefunfact"], "category": "fun", "description": "Fakta statistik kehidupan berdasarkan tanggal lahir", "usage": ".lifefact YYYY-MM-DD", "example": ".lifefact 2002-01-11", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-lifefact": "lifefact", "umi-lifefact": "lifefact", "umi-funfacthidup": "funfacthidup", "umi-livefunfact": "livefunfact", "lifefact": "lifefact", "funfacthidup": "funfacthidup", "livefunfact": "livefunfact"}
export default handler
