/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "clanreport", "category": "clan", "aliasMap": {"umi-clan-clanreport": "clanreport", "umi-clanreport": "clanreport", "umi-reportclan": "reportclan", "umi-laporanclan": "laporanclan", "umi-aktivitasclan": "aktivitasclan", "clanreport": "clanreport", "reportclan": "reportclan", "laporanclan": "laporanclan", "aktivitasclan": "aktivitasclan"}, "description": "Lihat laporan aktivitas clan", "usage": ".clanreport", "example": ".clanreport", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/clanraport.js", metadata, m, extra)
handler.help = ["umi-clan-clanreport"]
handler.command = ["umi-clan-clanreport", "umi-clanreport", "umi-reportclan", "umi-laporanclan", "umi-aktivitasclan", "clanreport", "reportclan", "laporanclan", "aktivitasclan"]
handler.tags = ["clan"]
handler.description = "Lihat laporan aktivitas clan"
handler.importSource = "umi"
handler.importConfig = {"name": "clanreport", "alias": ["reportclan", "laporanclan", "aktivitasclan"], "category": "clan", "description": "Lihat laporan aktivitas clan", "usage": ".clanreport", "example": ".clanreport", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-clanreport": "clanreport", "umi-clanreport": "clanreport", "umi-reportclan": "reportclan", "umi-laporanclan": "laporanclan", "umi-aktivitasclan": "aktivitasclan", "clanreport": "clanreport", "reportclan": "reportclan", "laporanclan": "laporanclan", "aktivitasclan": "aktivitasclan"}
export default handler
