import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hijriyah", "category": "islamic", "aliasMap": {"umi-islamic-hijriyah": "hijriyah", "umi-hijriyah": "hijriyah", "umi-hijri": "hijri", "umi-tahunislam": "tahunislam", "hijriyah": "hijriyah", "hijri": "hijri", "tahunislam": "tahunislam"}, "description": "Menampilkan tahun hijriah saat ini", "usage": ".hijriyah", "example": ".hijriyah", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/islamic/hijrah.js", metadata, m, extra)
handler.help = ["umi-islamic-hijriyah"]
handler.command = ["umi-islamic-hijriyah", "umi-hijriyah", "umi-hijri", "umi-tahunislam", "hijriyah", "hijri", "tahunislam"]
handler.tags = ["islamic"]
handler.description = "Menampilkan tahun hijriah saat ini"
handler.importSource = "umi"
handler.importConfig = {"name": "hijriyah", "alias": ["hijri", "tahunislam"], "category": "islamic", "description": "Menampilkan tahun hijriah saat ini", "usage": ".hijriyah", "example": ".hijriyah", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-islamic-hijriyah": "hijriyah", "umi-hijriyah": "hijriyah", "umi-hijri": "hijri", "umi-tahunislam": "tahunislam", "hijriyah": "hijriyah", "hijri": "hijri", "tahunislam": "tahunislam"}
export default handler
