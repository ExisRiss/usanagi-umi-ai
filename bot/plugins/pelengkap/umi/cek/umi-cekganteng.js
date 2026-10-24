/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekganteng", "category": "cek", "aliasMap": {"umi-cek-cekganteng": "cekganteng", "umi-cekganteng": "cekganteng", "umi-ganteng": "ganteng", "umi-handsome": "handsome", "handsome": "handsome"}, "description": "Cek seberapa ganteng kamu", "usage": ".cekganteng <nama>", "example": ".cekganteng Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekganteng.js", metadata, m, extra)
handler.help = ["umi-cek-cekganteng <nama>"]
handler.command = ["umi-cek-cekganteng", "umi-cekganteng", "umi-ganteng", "umi-handsome", "handsome"]
handler.tags = ["cek"]
handler.description = "Cek seberapa ganteng kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekganteng", "alias": ["ganteng", "handsome"], "category": "cek", "description": "Cek seberapa ganteng kamu", "usage": ".cekganteng <nama>", "example": ".cekganteng Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekganteng": "cekganteng", "umi-cekganteng": "cekganteng", "umi-ganteng": "ganteng", "umi-handsome": "handsome", "handsome": "handsome"}
export default handler
