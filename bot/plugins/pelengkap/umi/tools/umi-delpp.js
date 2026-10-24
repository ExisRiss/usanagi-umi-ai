/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delpp", "category": "tools", "aliasMap": {"umi-tools-delpp": "delpp", "umi-delpp": "delpp", "umi-delprofilebot": "delprofilebot", "umi-delppbot": "delppbot", "umi-hapusppbot": "hapusppbot", "delpp": "delpp", "delprofilebot": "delprofilebot", "delppbot": "delppbot", "hapusppbot": "hapusppbot"}, "description": "Menghapus foto profil bot", "usage": ".delpp", "example": ".delpp", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/delpp.js", metadata, m, extra)
handler.help = ["umi-tools-delpp"]
handler.command = ["umi-tools-delpp", "umi-delpp", "umi-delprofilebot", "umi-delppbot", "umi-hapusppbot", "delpp", "delprofilebot", "delppbot", "hapusppbot"]
handler.tags = ["tools"]
handler.description = "Menghapus foto profil bot"
handler.importSource = "umi"
handler.importConfig = {"name": "delpp", "alias": ["delprofilebot", "delppbot", "hapusppbot"], "category": "tools", "description": "Menghapus foto profil bot", "usage": ".delpp", "example": ".delpp", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-delpp": "delpp", "umi-delpp": "delpp", "umi-delprofilebot": "delprofilebot", "umi-delppbot": "delppbot", "umi-hapusppbot": "hapusppbot", "delpp": "delpp", "delprofilebot": "delprofilebot", "delppbot": "delppbot", "hapusppbot": "hapusppbot"}
export default handler
