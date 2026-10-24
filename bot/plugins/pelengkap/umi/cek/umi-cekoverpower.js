import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekoverpower", "category": "cek", "aliasMap": {"umi-cek-cekoverpower": "cekoverpower", "umi-cekoverpower": "cekoverpower", "umi-overpower": "overpower", "umi-op": "op"}, "description": "Cek tingkat overpower kamu", "usage": ".cekoverpower <nama>", "example": ".cekoverpower Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekoverpower.js", metadata, m, extra)
handler.help = ["umi-cek-cekoverpower <nama>"]
handler.command = ["umi-cek-cekoverpower", "umi-cekoverpower", "umi-overpower", "umi-op"]
handler.tags = ["cek"]
handler.description = "Cek tingkat overpower kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekoverpower", "alias": ["overpower", "op"], "category": "cek", "description": "Cek tingkat overpower kamu", "usage": ".cekoverpower <nama>", "example": ".cekoverpower Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekoverpower": "cekoverpower", "umi-cekoverpower": "cekoverpower", "umi-overpower": "overpower", "umi-op": "op"}
export default handler
