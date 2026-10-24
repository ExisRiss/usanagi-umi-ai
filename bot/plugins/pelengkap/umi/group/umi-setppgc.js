/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setppgc", "category": "group", "aliasMap": {"umi-group-setppgc": "setppgc", "umi-setppgc": "setppgc", "umi-setprofilegc": "setprofilegc", "umi-setppgroup": "setppgroup", "umi-setppgrup": "setppgrup", "setppgc": "setppgc", "setprofilegc": "setprofilegc", "setppgroup": "setppgroup", "setppgrup": "setppgrup"}, "description": "Mengubah foto profil grup", "usage": ".setppgc (reply gambar)", "example": ".setppgc", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/setppgc.js", metadata, m, extra)
handler.help = ["umi-group-setppgc (reply gambar)"]
handler.command = ["umi-group-setppgc", "umi-setppgc", "umi-setprofilegc", "umi-setppgroup", "umi-setppgrup", "setppgc", "setprofilegc", "setppgroup", "setppgrup"]
handler.tags = ["group"]
handler.description = "Mengubah foto profil grup"
handler.importSource = "umi"
handler.importConfig = {"name": "setppgc", "alias": ["setprofilegc", "setppgroup", "setppgrup"], "category": "group", "description": "Mengubah foto profil grup", "usage": ".setppgc (reply gambar)", "example": ".setppgc", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-setppgc": "setppgc", "umi-setppgc": "setppgc", "umi-setprofilegc": "setprofilegc", "umi-setppgroup": "setppgroup", "umi-setppgrup": "setppgrup", "setppgc": "setppgc", "setprofilegc": "setprofilegc", "setppgroup": "setppgroup", "setppgrup": "setppgrup"}
export default handler
