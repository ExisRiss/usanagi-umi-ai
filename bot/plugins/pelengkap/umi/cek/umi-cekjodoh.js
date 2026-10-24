import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekjodoh", "category": "cek", "aliasMap": {"umi-cek-cekjodoh": "cekjodoh"}, "description": "Cek kecocokan jodoh", "usage": ".cekjodoh <nama1> & <nama2>", "example": ".cekjodoh Budi & Ani", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekjodoh.js", metadata, m, extra)
handler.help = ["umi-cek-cekjodoh <nama1> & <nama2>"]
handler.command = ["umi-cek-cekjodoh"]
handler.tags = ["cek"]
handler.description = "Cek kecocokan jodoh"
handler.importSource = "umi"
handler.importConfig = {"name": "cekjodoh", "alias": ["jodoh", "match"], "category": "cek", "description": "Cek kecocokan jodoh", "usage": ".cekjodoh <nama1> & <nama2>", "example": ".cekjodoh Budi & Ani", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekjodoh": "cekjodoh"}
export default handler
