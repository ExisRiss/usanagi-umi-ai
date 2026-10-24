/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addenergi", "category": "owner", "aliasMap": {"umi-owner-addenergi": "addenergi", "umi-addenergi": "addenergi", "umi-tambahenergi": "tambahenergi", "umi-giveenergi": "giveenergi", "umi-addenergy": "addenergy", "addenergi": "addenergi", "tambahenergi": "tambahenergi", "giveenergi": "giveenergi", "addenergy": "addenergy"}, "description": "Tambah energi user", "usage": ".addenergi <jumlah> @user", "example": ".addenergi 100 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addenergi.js", metadata, m, extra)
handler.help = ["umi-owner-addenergi <jumlah> @user"]
handler.command = ["umi-owner-addenergi", "umi-addenergi", "umi-tambahenergi", "umi-giveenergi", "umi-addenergy", "addenergi", "tambahenergi", "giveenergi", "addenergy"]
handler.tags = ["owner"]
handler.description = "Tambah energi user"
handler.importSource = "umi"
handler.importConfig = {"name": "addenergi", "alias": ["tambahenergi", "giveenergi", "addenergy"], "category": "owner", "description": "Tambah energi user", "usage": ".addenergi <jumlah> @user", "example": ".addenergi 100 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addenergi": "addenergi", "umi-addenergi": "addenergi", "umi-tambahenergi": "tambahenergi", "umi-giveenergi": "giveenergi", "umi-addenergy": "addenergy", "addenergi": "addenergi", "tambahenergi": "tambahenergi", "giveenergi": "giveenergi", "addenergy": "addenergy"}
export default handler
