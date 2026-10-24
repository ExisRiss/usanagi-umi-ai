/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekngantuk", "category": "cek", "aliasMap": {"umi-cek-cekngantuk": "cekngantuk", "umi-cekngantuk": "cekngantuk", "umi-ngantuk": "ngantuk", "umi-sleepy": "sleepy", "sleepy": "sleepy"}, "description": "Cek tingkat ngantuk kamu", "usage": ".cekngantuk <nama>", "example": ".cekngantuk Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekngantuk.js", metadata, m, extra)
handler.help = ["umi-cek-cekngantuk <nama>"]
handler.command = ["umi-cek-cekngantuk", "umi-cekngantuk", "umi-ngantuk", "umi-sleepy", "sleepy"]
handler.tags = ["cek"]
handler.description = "Cek tingkat ngantuk kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekngantuk", "alias": ["ngantuk", "sleepy"], "category": "cek", "description": "Cek tingkat ngantuk kamu", "usage": ".cekngantuk <nama>", "example": ".cekngantuk Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekngantuk": "cekngantuk", "umi-cekngantuk": "cekngantuk", "umi-ngantuk": "ngantuk", "umi-sleepy": "sleepy", "sleepy": "sleepy"}
export default handler
