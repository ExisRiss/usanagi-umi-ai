import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hapusabsen", "category": "group", "aliasMap": {"umi-group-hapusabsen": "hapusabsen", "umi-hapusabsen": "hapusabsen", "umi-deleteabsen": "deleteabsen", "umi-tutupabsen": "tutupabsen", "umi-closeabsen": "closeabsen", "umi-resetabsen": "resetabsen", "hapusabsen": "hapusabsen", "deleteabsen": "deleteabsen", "tutupabsen": "tutupabsen", "closeabsen": "closeabsen"}, "description": "Hapus/tutup sesi absen (admin only)", "usage": ".hapusabsen", "example": ".hapusabsen", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/hapusabsen.js", metadata, m, extra)
handler.help = ["umi-group-hapusabsen"]
handler.command = ["umi-group-hapusabsen", "umi-hapusabsen", "umi-deleteabsen", "umi-tutupabsen", "umi-closeabsen", "umi-resetabsen", "hapusabsen", "deleteabsen", "tutupabsen", "closeabsen"]
handler.tags = ["group"]
handler.description = "Hapus/tutup sesi absen (admin only)"
handler.importSource = "umi"
handler.importConfig = {"name": "hapusabsen", "alias": ["deleteabsen", "tutupabsen", "closeabsen", "resetabsen"], "category": "group", "description": "Hapus/tutup sesi absen (admin only)", "usage": ".hapusabsen", "example": ".hapusabsen", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-hapusabsen": "hapusabsen", "umi-hapusabsen": "hapusabsen", "umi-deleteabsen": "deleteabsen", "umi-tutupabsen": "tutupabsen", "umi-closeabsen": "closeabsen", "umi-resetabsen": "resetabsen", "hapusabsen": "hapusabsen", "deleteabsen": "deleteabsen", "tutupabsen": "tutupabsen", "closeabsen": "closeabsen"}
export default handler
