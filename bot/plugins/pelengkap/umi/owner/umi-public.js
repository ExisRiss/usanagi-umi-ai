import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "public", "category": "owner", "aliasMap": {"umi-owner-public": "public", "umi-public": "public", "umi-publicmode": "publicmode", "publicmode": "publicmode"}, "description": "Mengaktifkan mode public (semua user bisa akses)", "usage": ".public", "example": ".public", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/public.js", metadata, m, extra)
handler.help = ["umi-owner-public"]
handler.command = ["umi-owner-public", "umi-public", "umi-publicmode", "publicmode"]
handler.tags = ["owner"]
handler.description = "Mengaktifkan mode public (semua user bisa akses)"
handler.importSource = "umi"
handler.importConfig = {"name": "public", "alias": ["publicmode", "open"], "category": "owner", "description": "Mengaktifkan mode public (semua user bisa akses)", "usage": ".public", "example": ".public", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-public": "public", "umi-public": "public", "umi-publicmode": "publicmode", "publicmode": "publicmode"}
export default handler
