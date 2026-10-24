import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekbaik", "category": "cek", "aliasMap": {"umi-cek-cekbaik": "cekbaik", "umi-cekbaik": "cekbaik", "umi-baik": "baik", "umi-kind": "kind", "kind": "kind"}, "description": "Cek seberapa baik kamu", "usage": ".cekbaik <nama>", "example": ".cekbaik Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekbaik.js", metadata, m, extra)
handler.help = ["umi-cek-cekbaik <nama>"]
handler.command = ["umi-cek-cekbaik", "umi-cekbaik", "umi-baik", "umi-kind", "kind"]
handler.tags = ["cek"]
handler.description = "Cek seberapa baik kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekbaik", "alias": ["baik", "kind"], "category": "cek", "description": "Cek seberapa baik kamu", "usage": ".cekbaik <nama>", "example": ".cekbaik Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekbaik": "cekbaik", "umi-cekbaik": "cekbaik", "umi-baik": "baik", "umi-kind": "kind", "kind": "kind"}
export default handler
