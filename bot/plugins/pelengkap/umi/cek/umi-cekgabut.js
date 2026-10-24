import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekgabut", "category": "cek", "aliasMap": {"umi-cek-cekgabut": "cekgabut", "umi-cekgabut": "cekgabut", "umi-gabut": "gabut", "umi-bored": "bored", "bored": "bored"}, "description": "Cek tingkat keGabutan kamu", "usage": ".cekgabut <nama>", "example": ".cekgabut Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekgabut.js", metadata, m, extra)
handler.help = ["umi-cek-cekgabut <nama>"]
handler.command = ["umi-cek-cekgabut", "umi-cekgabut", "umi-gabut", "umi-bored", "bored"]
handler.tags = ["cek"]
handler.description = "Cek tingkat keGabutan kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekgabut", "alias": ["gabut", "bored"], "category": "cek", "description": "Cek tingkat keGabutan kamu", "usage": ".cekgabut <nama>", "example": ".cekgabut Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekgabut": "cekgabut", "umi-cekgabut": "cekgabut", "umi-gabut": "gabut", "umi-bored": "bored", "bored": "bored"}
export default handler
