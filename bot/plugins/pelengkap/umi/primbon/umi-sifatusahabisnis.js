/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sifatusahabisnis", "category": "primbon", "aliasMap": {"umi-primbon-sifatusahabisnis": "sifatusahabisnis", "umi-sifatusahabisnis": "sifatusahabisnis", "umi-usahabisnis": "usahabisnis", "umi-sifatbisnis": "sifatbisnis", "sifatusahabisnis": "sifatusahabisnis", "usahabisnis": "usahabisnis", "sifatbisnis": "sifatbisnis"}, "description": "Cek sifat usaha/bisnis berdasarkan tanggal lahir", "usage": ".sifatusahabisnis <tgl> <bln> <thn>", "example": ".sifatusahabisnis 1 1 2000", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/primbon/sifatusahabisnis.js", metadata, m, extra)
handler.help = ["umi-primbon-sifatusahabisnis <tgl> <bln> <thn>"]
handler.command = ["umi-primbon-sifatusahabisnis", "umi-sifatusahabisnis", "umi-usahabisnis", "umi-sifatbisnis", "sifatusahabisnis", "usahabisnis", "sifatbisnis"]
handler.tags = ["primbon"]
handler.description = "Cek sifat usaha/bisnis berdasarkan tanggal lahir"
handler.importSource = "umi"
handler.importConfig = {"name": "sifatusahabisnis", "alias": ["usahabisnis", "sifatbisnis"], "category": "primbon", "description": "Cek sifat usaha/bisnis berdasarkan tanggal lahir", "usage": ".sifatusahabisnis <tgl> <bln> <thn>", "example": ".sifatusahabisnis 1 1 2000", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-primbon-sifatusahabisnis": "sifatusahabisnis", "umi-sifatusahabisnis": "sifatusahabisnis", "umi-usahabisnis": "usahabisnis", "umi-sifatbisnis": "sifatbisnis", "sifatusahabisnis": "sifatusahabisnis", "usahabisnis": "usahabisnis", "sifatbisnis": "sifatbisnis"}
export default handler
