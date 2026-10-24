/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekgamer", "category": "cek", "aliasMap": {"umi-cek-cekgamer": "cekgamer", "umi-cekgamer": "cekgamer", "umi-gamer": "gamer", "umi-pro": "pro"}, "description": "Cek seberapa pro gamer kamu", "usage": ".cekgamer <nama>", "example": ".cekgamer Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekgamer.js", metadata, m, extra)
handler.help = ["umi-cek-cekgamer <nama>"]
handler.command = ["umi-cek-cekgamer", "umi-cekgamer", "umi-gamer", "umi-pro"]
handler.tags = ["cek"]
handler.description = "Cek seberapa pro gamer kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekgamer", "alias": ["gamer", "pro"], "category": "cek", "description": "Cek seberapa pro gamer kamu", "usage": ".cekgamer <nama>", "example": ".cekgamer Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekgamer": "cekgamer", "umi-cekgamer": "cekgamer", "umi-gamer": "gamer", "umi-pro": "pro"}
export default handler
