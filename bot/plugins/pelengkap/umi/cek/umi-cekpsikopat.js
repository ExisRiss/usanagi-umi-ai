/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekpsikopat", "category": "cek", "aliasMap": {"umi-cek-cekpsikopat": "cekpsikopat", "umi-cekpsikopat": "cekpsikopat", "umi-psikopat": "psikopat", "umi-psycho": "psycho", "psycho": "psycho"}, "description": "Cek seberapa psikopat kamu", "usage": ".cekpsikopat <nama>", "example": ".cekpsikopat Budi", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/cek/cekpsikopat.js", metadata, m, extra)
handler.help = ["umi-cek-cekpsikopat <nama>"]
handler.command = ["umi-cek-cekpsikopat", "umi-cekpsikopat", "umi-psikopat", "umi-psycho", "psycho"]
handler.tags = ["cek"]
handler.description = "Cek seberapa psikopat kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "cekpsikopat", "alias": ["psikopat", "psycho"], "category": "cek", "description": "Cek seberapa psikopat kamu", "usage": ".cekpsikopat <nama>", "example": ".cekpsikopat Budi", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-cek-cekpsikopat": "cekpsikopat", "umi-cekpsikopat": "cekpsikopat", "umi-psikopat": "psikopat", "umi-psycho": "psycho", "psycho": "psycho"}
export default handler
