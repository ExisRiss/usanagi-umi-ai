/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setpp", "category": "tools", "aliasMap": {"umi-tools-setpp": "setpp", "umi-setpp": "setpp", "umi-setprofilebot": "setprofilebot", "umi-setppbot": "setppbot", "umi-setfotobot": "setfotobot", "setpp": "setpp", "setprofilebot": "setprofilebot", "setfotobot": "setfotobot"}, "description": "Mengubah foto profil bot", "usage": ".setpp (reply gambar)", "example": ".setpp", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/setpp.js", metadata, m, extra)
handler.help = ["umi-tools-setpp (reply gambar)"]
handler.command = ["umi-tools-setpp", "umi-setpp", "umi-setprofilebot", "umi-setppbot", "umi-setfotobot", "setpp", "setprofilebot", "setfotobot"]
handler.tags = ["tools"]
handler.description = "Mengubah foto profil bot"
handler.importSource = "umi"
handler.importConfig = {"name": "setpp", "alias": ["setprofilebot", "setppbot", "setfotobot"], "category": "tools", "description": "Mengubah foto profil bot", "usage": ".setpp (reply gambar)", "example": ".setpp", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-setpp": "setpp", "umi-setpp": "setpp", "umi-setprofilebot": "setprofilebot", "umi-setppbot": "setppbot", "umi-setfotobot": "setfotobot", "setpp": "setpp", "setprofilebot": "setprofilebot", "setfotobot": "setfotobot"}
export default handler
