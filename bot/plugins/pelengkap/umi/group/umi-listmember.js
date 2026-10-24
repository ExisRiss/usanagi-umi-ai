import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "listmember", "category": "group", "aliasMap": {"umi-group-listmember": "listmember", "umi-listmember": "listmember", "umi-memberlist": "memberlist", "umi-daftarmember": "daftarmember", "umi-listanggota": "listanggota", "listmember": "listmember", "memberlist": "memberlist", "daftarmember": "daftarmember", "listanggota": "listanggota"}, "description": "Menampilkan daftar anggota grup", "usage": ".listmember", "example": ".listmember", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/listmember.js", metadata, m, extra)
handler.help = ["umi-group-listmember"]
handler.command = ["umi-group-listmember", "umi-listmember", "umi-memberlist", "umi-daftarmember", "umi-listanggota", "listmember", "memberlist", "daftarmember", "listanggota"]
handler.tags = ["group"]
handler.description = "Menampilkan daftar anggota grup"
handler.importSource = "umi"
handler.importConfig = {"name": "listmember", "alias": ["memberlist", "daftarmember", "listanggota"], "category": "group", "description": "Menampilkan daftar anggota grup", "usage": ".listmember", "example": ".listmember", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-listmember": "listmember", "umi-listmember": "listmember", "umi-memberlist": "memberlist", "umi-daftarmember": "daftarmember", "umi-listanggota": "listanggota", "listmember": "listmember", "memberlist": "memberlist", "daftarmember": "daftarmember", "listanggota": "listanggota"}
export default handler
