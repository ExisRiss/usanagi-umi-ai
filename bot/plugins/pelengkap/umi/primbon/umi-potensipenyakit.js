import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "potensipenyakit", "category": "primbon", "aliasMap": {"umi-primbon-potensipenyakit": "potensipenyakit", "umi-potensipenyakit": "potensipenyakit", "umi-cekpenyakit": "cekpenyakit", "umi-penyakit": "penyakit", "potensipenyakit": "potensipenyakit", "cekpenyakit": "cekpenyakit", "penyakit": "penyakit"}, "description": "Cek potensi penyakit berdasarkan tanggal lahir", "usage": ".potensipenyakit <tgl> <bln> <thn>", "example": ".potensipenyakit 12 05 1998", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/primbon/potensipenyakit.js", metadata, m, extra)
handler.help = ["umi-primbon-potensipenyakit <tgl> <bln> <thn>"]
handler.command = ["umi-primbon-potensipenyakit", "umi-potensipenyakit", "umi-cekpenyakit", "umi-penyakit", "potensipenyakit", "cekpenyakit", "penyakit"]
handler.tags = ["primbon"]
handler.description = "Cek potensi penyakit berdasarkan tanggal lahir"
handler.importSource = "umi"
handler.importConfig = {"name": "potensipenyakit", "alias": ["cekpenyakit", "penyakit"], "category": "primbon", "description": "Cek potensi penyakit berdasarkan tanggal lahir", "usage": ".potensipenyakit <tgl> <bln> <thn>", "example": ".potensipenyakit 12 05 1998", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-primbon-potensipenyakit": "potensipenyakit", "umi-potensipenyakit": "potensipenyakit", "umi-cekpenyakit": "cekpenyakit", "umi-penyakit": "penyakit", "potensipenyakit": "potensipenyakit", "cekpenyakit": "cekpenyakit", "penyakit": "penyakit"}
export default handler
