import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekprem", "category": "cek", "aliasMap": {"umi-cek-cekprem": "cekprem", "umi-cekprem": "cekprem", "umi-cekpremium": "cekpremium", "umi-preminfo": "preminfo", "cekprem": "cekprem", "cekpremium": "cekpremium", "preminfo": "preminfo"}, "description": "Cek detail status premium user", "usage": ".cekprem @user", "example": ".cekprem", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekprem.js", metadata, m, extra)
handler.help = ["umi-cek-cekprem @user"]
handler.command = ["umi-cek-cekprem", "umi-cekprem", "umi-cekpremium", "umi-preminfo", "cekprem", "cekpremium", "preminfo"]
handler.tags = ["cek"]
handler.description = "Cek detail status premium user"
handler.importSource = "umi"
handler.importConfig = {"name": "cekprem", "alias": ["cekpremium", "preminfo"], "category": "cek", "description": "Cek detail status premium user", "usage": ".cekprem @user", "example": ".cekprem", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekprem": "cekprem", "umi-cekprem": "cekprem", "umi-cekpremium": "cekpremium", "umi-preminfo": "preminfo", "cekprem": "cekprem", "cekpremium": "cekpremium", "preminfo": "preminfo"}
export default handler
