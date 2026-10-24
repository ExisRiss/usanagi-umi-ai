import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "colongpp", "category": "owner", "aliasMap": {"umi-owner-colongpp": "colongpp", "umi-colongpp": "colongpp", "umi-stealpp": "stealpp", "umi-malingpp": "malingpp", "umi-ambilpp": "ambilpp", "colongpp": "colongpp", "stealpp": "stealpp", "malingpp": "malingpp", "ambilpp": "ambilpp"}, "description": "Ambil & pakai foto profil target sebagai PP bot", "usage": ".colongpp (reply pesan target)", "example": ".colongpp", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/colongpp.js", metadata, m, extra)
handler.help = ["umi-owner-colongpp (reply pesan target)"]
handler.command = ["umi-owner-colongpp", "umi-colongpp", "umi-stealpp", "umi-malingpp", "umi-ambilpp", "colongpp", "stealpp", "malingpp", "ambilpp"]
handler.tags = ["owner"]
handler.description = "Ambil & pakai foto profil target sebagai PP bot"
handler.importSource = "umi"
handler.importConfig = {"name": "colongpp", "alias": ["stealpp", "malingpp", "ambilpp"], "category": "owner", "description": "Ambil & pakai foto profil target sebagai PP bot", "usage": ".colongpp (reply pesan target)", "example": ".colongpp", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-colongpp": "colongpp", "umi-colongpp": "colongpp", "umi-stealpp": "stealpp", "umi-malingpp": "malingpp", "umi-ambilpp": "ambilpp", "colongpp": "colongpp", "stealpp": "stealpp", "malingpp": "malingpp", "ambilpp": "ambilpp"}
export default handler
