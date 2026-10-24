import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "proses", "category": "store", "aliasMap": {"umi-store-proses": "proses", "umi-proses": "proses", "umi-prs": "prs", "umi-process": "process", "proses": "proses", "prs": "prs", "process": "process"}, "description": "Mulai proses transaksi dengan buyer", "usage": ".prs", "example": ".prs", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/store/proses.js", metadata, m, extra)
handler.help = ["umi-store-proses"]
handler.command = ["umi-store-proses", "umi-proses", "umi-prs", "umi-process", "proses", "prs", "process"]
handler.tags = ["store"]
handler.description = "Mulai proses transaksi dengan buyer"
handler.importSource = "umi"
handler.importConfig = {"name": "proses", "alias": ["prs", "process"], "category": "store", "description": "Mulai proses transaksi dengan buyer", "usage": ".prs", "example": ".prs", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-store-proses": "proses", "umi-proses": "proses", "umi-prs": "prs", "umi-process": "process", "proses": "proses", "prs": "prs", "process": "process"}
export default handler
