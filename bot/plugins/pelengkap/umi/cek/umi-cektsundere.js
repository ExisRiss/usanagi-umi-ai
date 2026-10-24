import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cektsundere", "category": "cek", "aliasMap": {"umi-cek-cektsundere": "cektsundere", "umi-cektsundere": "cektsundere", "umi-tsundere": "tsundere"}, "description": "Cek tingkat tsundere kamu", "usage": ".cektsundere <nama>", "example": ".cektsundere Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cektsundere.js", metadata, m, extra)
handler.help = ["umi-cek-cektsundere <nama>"]
handler.command = ["umi-cek-cektsundere", "umi-cektsundere", "umi-tsundere"]
handler.tags = ["cek"]
handler.description = "Cek tingkat tsundere kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cektsundere", "alias": ["tsundere"], "category": "cek", "description": "Cek tingkat tsundere kamu", "usage": ".cektsundere <nama>", "example": ".cektsundere Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cektsundere": "cektsundere", "umi-cektsundere": "cektsundere", "umi-tsundere": "tsundere"}
export default handler
