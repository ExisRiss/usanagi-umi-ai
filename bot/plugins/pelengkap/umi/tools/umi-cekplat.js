import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekplat", "category": "tools", "aliasMap": {"umi-tools-cekplat": "cekplat", "umi-cekplat": "cekplat", "umi-plat": "plat", "umi-cekplatnomor": "cekplatnomor", "umi-platnomor": "platnomor", "cekplat": "cekplat", "plat": "plat", "cekplatnomor": "cekplatnomor", "platnomor": "platnomor"}, "description": "Cek informasi asal wilayah dan jenis kendaraan dari plat nomor", "usage": ".cekplat <plat_nomor>", "example": ".cekplat B 1234 XYZ", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/cekplat.js", metadata, m, extra)
handler.help = ["umi-tools-cekplat <plat_nomor>"]
handler.command = ["umi-tools-cekplat", "umi-cekplat", "umi-plat", "umi-cekplatnomor", "umi-platnomor", "cekplat", "plat", "cekplatnomor", "platnomor"]
handler.tags = ["tools"]
handler.description = "Cek informasi asal wilayah dan jenis kendaraan dari plat nomor"
handler.importSource = "umi"
handler.importConfig = {"name": "cekplat", "alias": ["plat", "cekplatnomor", "platnomor"], "category": "tools", "description": "Cek informasi asal wilayah dan jenis kendaraan dari plat nomor", "usage": ".cekplat <plat_nomor>", "example": ".cekplat B 1234 XYZ", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-cekplat": "cekplat", "umi-cekplat": "cekplat", "umi-plat": "plat", "umi-cekplatnomor": "cekplatnomor", "umi-platnomor": "platnomor", "cekplat": "cekplat", "plat": "plat", "cekplatnomor": "cekplatnomor", "platnomor": "platnomor"}
export default handler
