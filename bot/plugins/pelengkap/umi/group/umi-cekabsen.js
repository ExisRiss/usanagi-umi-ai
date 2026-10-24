import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cekabsen", "category": "group", "aliasMap": {"umi-group-cekabsen": "cekabsen", "umi-cekabsen": "cekabsen", "umi-listabsen": "listabsen", "umi-daftarabsen": "daftarabsen", "umi-lihathadir": "lihathadir", "cekabsen": "cekabsen", "daftarabsen": "daftarabsen", "lihathadir": "lihathadir"}, "description": "Lihat daftar peserta yang sudah absen", "usage": ".cekabsen", "example": ".cekabsen", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/cekabsen.js", metadata, m, extra)
handler.help = ["umi-group-cekabsen"]
handler.command = ["umi-group-cekabsen", "umi-cekabsen", "umi-listabsen", "umi-daftarabsen", "umi-lihathadir", "cekabsen", "daftarabsen", "lihathadir"]
handler.tags = ["group"]
handler.description = "Lihat daftar peserta yang sudah absen"
handler.importSource = "umi"
handler.importConfig = {"name": "cekabsen", "alias": ["listabsen", "daftarabsen", "lihathadir"], "category": "group", "description": "Lihat daftar peserta yang sudah absen", "usage": ".cekabsen", "example": ".cekabsen", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-cekabsen": "cekabsen", "umi-cekabsen": "cekabsen", "umi-listabsen": "listabsen", "umi-daftarabsen": "daftarabsen", "umi-lihathadir": "lihathadir", "cekabsen": "cekabsen", "daftarabsen": "daftarabsen", "lihathadir": "lihathadir"}
export default handler
