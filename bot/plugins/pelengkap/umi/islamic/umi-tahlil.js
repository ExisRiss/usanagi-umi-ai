/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tahlil", "category": "religi", "aliasMap": {"umi-religi-tahlil": "tahlil", "umi-tahlil": "tahlil", "umi-tahlilan": "tahlilan", "umi-doatahlil": "doatahlil", "tahlil": "tahlil", "tahlilan": "tahlilan", "doatahlil": "doatahlil"}, "description": "Panduan Tahlil Lengkap (Doa, Bacaan, dan Tata Cara)", "usage": ".tahlil", "example": ".tahlil", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/tahlil.js", metadata, m, extra)
handler.help = ["umi-religi-tahlil"]
handler.command = ["umi-religi-tahlil", "umi-tahlil", "umi-tahlilan", "umi-doatahlil", "tahlil", "tahlilan", "doatahlil"]
handler.tags = ["religi"]
handler.description = "Panduan Tahlil Lengkap (Doa, Bacaan, dan Tata Cara)"
handler.importSource = "umi"
handler.importConfig = {"name": "tahlil", "alias": ["tahlilan", "doatahlil", "tahlil"], "category": "religi", "description": "Panduan Tahlil Lengkap (Doa, Bacaan, dan Tata Cara)", "usage": ".tahlil", "example": ".tahlil", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-tahlil": "tahlil", "umi-tahlil": "tahlil", "umi-tahlilan": "tahlilan", "umi-doatahlil": "doatahlil", "tahlil": "tahlil", "tahlilan": "tahlilan", "doatahlil": "doatahlil"}
export default handler
