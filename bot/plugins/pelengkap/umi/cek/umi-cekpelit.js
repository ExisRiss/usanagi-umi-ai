/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekpelit", "category": "cek", "aliasMap": {"umi-cek-cekpelit": "cekpelit", "umi-cekpelit": "cekpelit", "umi-pelit": "pelit", "umi-kikir": "kikir", "kikir": "kikir"}, "description": "Cek seberapa pelit kamu", "usage": ".cekpelit <nama>", "example": ".cekpelit Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekpelit.js", metadata, m, extra)
handler.help = ["umi-cek-cekpelit <nama>"]
handler.command = ["umi-cek-cekpelit", "umi-cekpelit", "umi-pelit", "umi-kikir", "kikir"]
handler.tags = ["cek"]
handler.description = "Cek seberapa pelit kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekpelit", "alias": ["pelit", "kikir"], "category": "cek", "description": "Cek seberapa pelit kamu", "usage": ".cekpelit <nama>", "example": ".cekpelit Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekpelit": "cekpelit", "umi-cekpelit": "cekpelit", "umi-pelit": "pelit", "umi-kikir": "kikir", "kikir": "kikir"}
export default handler
