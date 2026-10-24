import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceknamadana", "category": "tools", "aliasMap": {"umi-tools-ceknamadana": "ceknamadana", "umi-ceknamadana": "ceknamadana", "umi-cekdana": "cekdana", "ceknamadana": "ceknamadana", "cekdana": "cekdana"}, "description": "Cek Nama Pengguna Dana", "usage": ".cekdana", "example": ".cekdana", "cooldown": 3, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/ceknamadana.js", metadata, m, extra)
handler.help = ["umi-tools-ceknamadana"]
handler.command = ["umi-tools-ceknamadana", "umi-ceknamadana", "umi-cekdana", "ceknamadana", "cekdana"]
handler.tags = ["tools"]
handler.description = "Cek Nama Pengguna Dana"
handler.importSource = "umi"
handler.importConfig = {"name": "ceknamadana", "alias": ["cekdana"], "category": "tools", "description": "Cek Nama Pengguna Dana", "usage": ".cekdana", "example": ".cekdana", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-ceknamadana": "ceknamadana", "umi-ceknamadana": "ceknamadana", "umi-cekdana": "cekdana", "ceknamadana": "ceknamadana", "cekdana": "cekdana"}
export default handler
