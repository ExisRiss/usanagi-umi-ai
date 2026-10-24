import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekjahat", "category": "cek", "aliasMap": {"umi-cek-cekjahat": "cekjahat", "umi-cekjahat": "cekjahat", "umi-evil": "evil", "evil": "evil"}, "description": "Cek seberapa jahat kamu", "usage": ".cekjahat <nama>", "example": ".cekjahat Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekjahat.js", metadata, m, extra)
handler.help = ["umi-cek-cekjahat <nama>"]
handler.command = ["umi-cek-cekjahat", "umi-cekjahat", "umi-evil", "evil"]
handler.tags = ["cek"]
handler.description = "Cek seberapa jahat kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekjahat", "alias": ["jahat", "evil"], "category": "cek", "description": "Cek seberapa jahat kamu", "usage": ".cekjahat <nama>", "example": ".cekjahat Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekjahat": "cekjahat", "umi-cekjahat": "cekjahat", "umi-evil": "evil", "evil": "evil"}
export default handler
