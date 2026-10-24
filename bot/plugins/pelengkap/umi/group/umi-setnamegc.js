/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setnamegc", "category": "group", "aliasMap": {"umi-group-setnamegc": "setnamegc", "umi-setnamegc": "setnamegc", "umi-setnamegrup": "setnamegrup", "umi-setgcname": "setgcname", "umi-setnamegroup": "setnamegroup", "umi-setnamagrup": "setnamagrup", "setnamegc": "setnamegc", "setnamegrup": "setnamegrup", "setgcname": "setgcname", "setnamegroup": "setnamegroup", "setnamagrup": "setnamagrup"}, "description": "Mengubah nama grup", "usage": ".setnamegc <nama baru>", "example": ".setnamegc Grup Keren", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/setnamegc.js", metadata, m, extra)
handler.help = ["umi-group-setnamegc <nama baru>"]
handler.command = ["umi-group-setnamegc", "umi-setnamegc", "umi-setnamegrup", "umi-setgcname", "umi-setnamegroup", "umi-setnamagrup", "setnamegc", "setnamegrup", "setgcname", "setnamegroup", "setnamagrup"]
handler.tags = ["group"]
handler.description = "Mengubah nama grup"
handler.importSource = "umi"
handler.importConfig = {"name": "setnamegc", "alias": ["setnamegrup", "setgcname", "setnamegroup", "setnamagrup"], "category": "group", "description": "Mengubah nama grup", "usage": ".setnamegc <nama baru>", "example": ".setnamegc Grup Keren", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-setnamegc": "setnamegc", "umi-setnamegc": "setnamegc", "umi-setnamegrup": "setnamegrup", "umi-setgcname": "setgcname", "umi-setnamegroup": "setnamegroup", "umi-setnamagrup": "setnamagrup", "setnamegc": "setnamegc", "setnamegrup": "setnamegrup", "setgcname": "setgcname", "setnamegroup": "setnamegroup", "setnamagrup": "setnamagrup"}
export default handler
