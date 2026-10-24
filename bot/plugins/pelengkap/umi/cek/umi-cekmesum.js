import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekmesum", "category": "cek", "aliasMap": {"umi-cek-cekmesum": "cekmesum", "umi-cekmesum": "cekmesum", "umi-mesum": "mesum"}, "description": "Cek seberapa mesum kamu", "usage": ".cekmesum <nama>", "example": ".cekmesum Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekmesum.js", metadata, m, extra)
handler.help = ["umi-cek-cekmesum <nama>"]
handler.command = ["umi-cek-cekmesum", "umi-cekmesum", "umi-mesum"]
handler.tags = ["cek"]
handler.description = "Cek seberapa mesum kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekmesum", "alias": ["mesum"], "category": "cek", "description": "Cek seberapa mesum kamu", "usage": ".cekmesum <nama>", "example": ".cekmesum Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekmesum": "cekmesum", "umi-cekmesum": "cekmesum", "umi-mesum": "mesum"}
export default handler
