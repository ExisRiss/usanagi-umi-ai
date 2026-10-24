/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekmalas", "category": "cek", "aliasMap": {"umi-cek-cekmalas": "cekmalas", "umi-cekmalas": "cekmalas", "umi-malas": "malas", "umi-lazy": "lazy", "lazy": "lazy"}, "description": "Cek seberapa malas kamu", "usage": ".cekmalas <nama>", "example": ".cekmalas Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekmalas.js", metadata, m, extra)
handler.help = ["umi-cek-cekmalas <nama>"]
handler.command = ["umi-cek-cekmalas", "umi-cekmalas", "umi-malas", "umi-lazy", "lazy"]
handler.tags = ["cek"]
handler.description = "Cek seberapa malas kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekmalas", "alias": ["malas", "lazy"], "category": "cek", "description": "Cek seberapa malas kamu", "usage": ".cekmalas <nama>", "example": ".cekmalas Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekmalas": "cekmalas", "umi-cekmalas": "cekmalas", "umi-malas": "malas", "umi-lazy": "lazy", "lazy": "lazy"}
export default handler
