import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "mulaiabsen", "category": "group", "aliasMap": {"umi-group-mulaiabsen": "mulaiabsen", "umi-mulaiabsen": "mulaiabsen", "umi-startabsen": "startabsen", "umi-bukaabsen": "bukaabsen", "umi-openabsen": "openabsen", "startabsen": "startabsen", "bukaabsen": "bukaabsen", "openabsen": "openabsen"}, "description": "Mulai sesi absen di grup (admin only)", "usage": ".mulaiabsen [keterangan]", "example": ".mulaiabsen Rapat Mingguan", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/mulaiabsen.js", metadata, m, extra)
handler.help = ["umi-group-mulaiabsen [keterangan]"]
handler.command = ["umi-group-mulaiabsen", "umi-mulaiabsen", "umi-startabsen", "umi-bukaabsen", "umi-openabsen", "startabsen", "bukaabsen", "openabsen"]
handler.tags = ["group"]
handler.description = "Mulai sesi absen di grup (admin only)"
handler.importSource = "umi"
handler.importConfig = {"name": "mulaiabsen", "alias": ["startabsen", "bukaabsen", "openabsen"], "category": "group", "description": "Mulai sesi absen di grup (admin only)", "usage": ".mulaiabsen [keterangan]", "example": ".mulaiabsen Rapat Mingguan", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true, "isAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-mulaiabsen": "mulaiabsen", "umi-mulaiabsen": "mulaiabsen", "umi-startabsen": "startabsen", "umi-bukaabsen": "bukaabsen", "umi-openabsen": "openabsen", "startabsen": "startabsen", "bukaabsen": "bukaabsen", "openabsen": "openabsen"}
export default handler
