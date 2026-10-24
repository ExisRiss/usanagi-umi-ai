import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekrezeki", "category": "cek", "aliasMap": {"umi-cek-cekrezeki": "cekrezeki", "umi-cekrezeki": "cekrezeki", "umi-rezeki": "rezeki", "umi-fortune": "fortune"}, "description": "Cek tingkat rezeki kamu hari ini", "usage": ".cekrezeki <nama>", "example": ".cekrezeki Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekrezeki.js", metadata, m, extra)
handler.help = ["umi-cek-cekrezeki <nama>"]
handler.command = ["umi-cek-cekrezeki", "umi-cekrezeki", "umi-rezeki", "umi-fortune"]
handler.tags = ["cek"]
handler.description = "Cek tingkat rezeki kamu hari ini"
handler.importSource = "umi"
handler.importConfig = {"name": "cekrezeki", "alias": ["rezeki", "fortune"], "category": "cek", "description": "Cek tingkat rezeki kamu hari ini", "usage": ".cekrezeki <nama>", "example": ".cekrezeki Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekrezeki": "cekrezeki", "umi-cekrezeki": "cekrezeki", "umi-rezeki": "rezeki", "umi-fortune": "fortune"}
export default handler
