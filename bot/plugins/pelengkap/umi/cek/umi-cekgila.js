/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekgila", "category": "cek", "aliasMap": {"umi-cek-cekgila": "cekgila", "umi-cekgila": "cekgila", "umi-gila": "gila", "umi-crazy": "crazy", "crazy": "crazy"}, "description": "Cek seberapa gila kamu", "usage": ".cekgila <nama>", "example": ".cekgila Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekgila.js", metadata, m, extra)
handler.help = ["umi-cek-cekgila <nama>"]
handler.command = ["umi-cek-cekgila", "umi-cekgila", "umi-gila", "umi-crazy", "crazy"]
handler.tags = ["cek"]
handler.description = "Cek seberapa gila kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekgila", "alias": ["gila", "crazy"], "category": "cek", "description": "Cek seberapa gila kamu", "usage": ".cekgila <nama>", "example": ".cekgila Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekgila": "cekgila", "umi-cekgila": "cekgila", "umi-gila": "gila", "umi-crazy": "crazy", "crazy": "crazy"}
export default handler
