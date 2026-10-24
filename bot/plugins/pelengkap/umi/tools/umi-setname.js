/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setname", "category": "tools", "aliasMap": {"umi-tools-setname": "setname", "umi-setname": "setname", "umi-setnamebot": "setnamebot", "umi-setbotnama": "setbotnama", "setname": "setname", "setnamebot": "setnamebot", "setbotnama": "setbotnama"}, "description": "Mengubah nama profil bot", "usage": ".setname <nama baru>", "example": ".setname Umi-AI", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/setname.js", metadata, m, extra)
handler.help = ["umi-tools-setname <nama baru>"]
handler.command = ["umi-tools-setname", "umi-setname", "umi-setnamebot", "umi-setbotnama", "setname", "setnamebot", "setbotnama"]
handler.tags = ["tools"]
handler.description = "Mengubah nama profil bot"
handler.importSource = "umi"
handler.importConfig = {"name": "setname", "alias": ["setnamebot", "setbotnama"], "category": "tools", "description": "Mengubah nama profil bot", "usage": ".setname <nama baru>", "example": ".setname Umi-AI", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-setname": "setname", "umi-setname": "setname", "umi-setnamebot": "setnamebot", "umi-setbotnama": "setbotnama", "setname": "setname", "setnamebot": "setnamebot", "setbotnama": "setbotnama"}
export default handler
