/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ramalanjodoh", "category": "primbon", "aliasMap": {"umi-primbon-ramalanjodoh": "ramalanjodoh", "umi-ramalanjodoh": "ramalanjodoh", "ramalanjodoh": "ramalanjodoh"}, "description": "Ramalan jodoh berdasarkan primbon Jawa", "usage": ".ramalanjodoh nama1 tgl1 bln1 thn1 nama2 tgl2 bln2 thn2", "example": ".ramalanjodoh putu 16 11 2007 keyla 1 1 2008", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/primbon/ramalanjodoh.js", metadata, m, extra)
handler.help = ["umi-primbon-ramalanjodoh nama1 tgl1 bln1 thn1 nama2 tgl2 bln2 thn2"]
handler.command = ["umi-primbon-ramalanjodoh", "umi-ramalanjodoh", "ramalanjodoh"]
handler.tags = ["primbon"]
handler.description = "Ramalan jodoh berdasarkan primbon Jawa"
handler.importSource = "umi"
handler.importConfig = {"name": "ramalanjodoh", "alias": ["jodoh", "cekjodoh"], "category": "primbon", "description": "Ramalan jodoh berdasarkan primbon Jawa", "usage": ".ramalanjodoh nama1 tgl1 bln1 thn1 nama2 tgl2 bln2 thn2", "example": ".ramalanjodoh putu 16 11 2007 keyla 1 1 2008", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-primbon-ramalanjodoh": "ramalanjodoh", "umi-ramalanjodoh": "ramalanjodoh", "ramalanjodoh": "ramalanjodoh"}
export default handler
