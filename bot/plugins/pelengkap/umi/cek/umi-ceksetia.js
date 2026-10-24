import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "ceksetia", "category": "cek", "aliasMap": {"umi-cek-ceksetia": "ceksetia", "umi-ceksetia": "ceksetia", "umi-setia": "setia", "umi-loyal": "loyal", "loyal": "loyal"}, "description": "Cek tingkat kesetiaan kamu", "usage": ".ceksetia <nama>", "example": ".ceksetia Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/ceksetia.js", metadata, m, extra)
handler.help = ["umi-cek-ceksetia <nama>"]
handler.command = ["umi-cek-ceksetia", "umi-ceksetia", "umi-setia", "umi-loyal", "loyal"]
handler.tags = ["cek"]
handler.description = "Cek tingkat kesetiaan kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "ceksetia", "alias": ["setia", "loyal"], "category": "cek", "description": "Cek tingkat kesetiaan kamu", "usage": ".ceksetia <nama>", "example": ".ceksetia Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-ceksetia": "ceksetia", "umi-ceksetia": "ceksetia", "umi-setia": "setia", "umi-loyal": "loyal", "loyal": "loyal"}
export default handler
