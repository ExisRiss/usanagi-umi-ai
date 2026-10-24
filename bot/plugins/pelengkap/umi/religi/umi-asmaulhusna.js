/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "asmaulhusna", "category": "religi", "aliasMap": {"umi-religi-asmaulhusna": "asmaulhusna", "umi-asmaul": "asmaul", "umi-husna": "husna", "umi-99names": "99names", "asmaulhusna": "asmaulhusna", "asmaul": "asmaul", "husna": "husna", "99names": "99names"}, "description": "99 Nama Allah (Asmaul Husna)", "usage": ".asmaulhusna [nomor/nama]", "example": ".asmaulhusna 1\n.asmaulhusna ar rahman", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/religi/asmaulhusna.js", metadata, m, extra)
handler.help = ["umi-religi-asmaulhusna [nomor/nama]"]
handler.command = ["umi-religi-asmaulhusna", "umi-asmaul", "umi-husna", "umi-99names", "asmaulhusna", "asmaul", "husna", "99names"]
handler.tags = ["religi"]
handler.description = "99 Nama Allah (Asmaul Husna)"
handler.importSource = "umi"
handler.importConfig = {"name": "asmaulhusna", "alias": ["asmaul", "husna", "99names"], "category": "religi", "description": "99 Nama Allah (Asmaul Husna)", "usage": ".asmaulhusna [nomor/nama]", "example": ".asmaulhusna 1\n.asmaulhusna ar rahman", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-religi-asmaulhusna": "asmaulhusna", "umi-asmaul": "asmaul", "umi-husna": "husna", "umi-99names": "99names", "asmaulhusna": "asmaulhusna", "asmaul": "asmaul", "husna": "husna", "99names": "99names"}
export default handler
