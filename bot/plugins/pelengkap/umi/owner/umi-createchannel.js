/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "createchannel", "category": "owner", "aliasMap": {"umi-owner-createchannel": "createchannel", "umi-createchannel": "createchannel", "umi-createch": "createch", "createchannel": "createchannel", "createch": "createch"}, "description": "Membuat WhatsApp Channel/newsletter baru", "usage": ".createchannel <nama>|<deskripsi>", "example": ".createchannel Umi MD|Channel resmi bot", "cooldown": 10}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/createchannel.js", metadata, m, extra)
handler.help = ["umi-owner-createchannel <nama>|<deskripsi>"]
handler.command = ["umi-owner-createchannel", "umi-createchannel", "umi-createch", "createchannel", "createch"]
handler.tags = ["owner"]
handler.description = "Membuat WhatsApp Channel/newsletter baru"
handler.importSource = "umi"
handler.importConfig = {"name": "createchannel", "alias": ["createch"], "category": "owner", "description": "Membuat WhatsApp Channel/newsletter baru", "usage": ".createchannel <nama>|<deskripsi>", "example": ".createchannel Umi MD|Channel resmi bot", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-createchannel": "createchannel", "umi-createchannel": "createchannel", "umi-createch": "createch", "createchannel": "createchannel", "createch": "createch"}
export default handler
