import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekxl", "category": "tools", "aliasMap": {"umi-tools-cekxl": "cekxl", "umi-cekxl": "cekxl", "umi-checkxl": "checkxl", "umi-xlcheck": "xlcheck", "umi-xlcek": "xlcek", "cekxl": "cekxl", "checkxl": "checkxl", "xlcheck": "xlcheck", "xlcek": "xlcek"}, "description": "Cek informasi paket dan kuota nomor XL/Axis secara detail", "usage": ".cekxl <nomor>", "example": ".cekxl 083150850721", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/cekxl.js", metadata, m, extra)
handler.help = ["umi-tools-cekxl <nomor>"]
handler.command = ["umi-tools-cekxl", "umi-cekxl", "umi-checkxl", "umi-xlcheck", "umi-xlcek", "cekxl", "checkxl", "xlcheck", "xlcek"]
handler.tags = ["tools"]
handler.description = "Cek informasi paket dan kuota nomor XL/Axis secara detail"
handler.importSource = "umi"
handler.importConfig = {"name": "cekxl", "alias": ["checkxl", "xlcheck", "xlcek"], "category": "tools", "description": "Cek informasi paket dan kuota nomor XL/Axis secara detail", "usage": ".cekxl <nomor>", "example": ".cekxl 083150850721", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-cekxl": "cekxl", "umi-cekxl": "cekxl", "umi-checkxl": "checkxl", "umi-xlcheck": "xlcheck", "umi-xlcek": "xlcek", "cekxl": "cekxl", "checkxl": "checkxl", "xlcheck": "xlcheck", "xlcek": "xlcek"}
export default handler
