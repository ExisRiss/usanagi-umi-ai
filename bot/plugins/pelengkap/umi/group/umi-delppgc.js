/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delppgc", "category": "group", "aliasMap": {"umi-group-delppgc": "delppgc", "umi-delppgc": "delppgc", "umi-delprofilegc": "delprofilegc", "umi-delppgroup": "delppgroup", "umi-hapusppgc": "hapusppgc", "delppgc": "delppgc", "delprofilegc": "delprofilegc", "delppgroup": "delppgroup", "hapusppgc": "hapusppgc"}, "description": "Menghapus foto profil grup", "usage": ".delppgc", "example": ".delppgc", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/delppgc.js", metadata, m, extra)
handler.help = ["umi-group-delppgc"]
handler.command = ["umi-group-delppgc", "umi-delppgc", "umi-delprofilegc", "umi-delppgroup", "umi-hapusppgc", "delppgc", "delprofilegc", "delppgroup", "hapusppgc"]
handler.tags = ["group"]
handler.description = "Menghapus foto profil grup"
handler.importSource = "umi"
handler.importConfig = {"name": "delppgc", "alias": ["delprofilegc", "delppgroup", "hapusppgc"], "category": "group", "description": "Menghapus foto profil grup", "usage": ".delppgc", "example": ".delppgc", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-delppgc": "delppgc", "umi-delppgc": "delppgc", "umi-delprofilegc": "delprofilegc", "umi-delppgroup": "delppgroup", "umi-hapusppgc": "hapusppgc", "delppgc": "delppgc", "delprofilegc": "delprofilegc", "delppgroup": "delppgroup", "hapusppgc": "hapusppgc"}
export default handler
