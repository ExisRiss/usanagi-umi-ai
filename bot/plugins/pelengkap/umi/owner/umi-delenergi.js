/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "delenergi", "category": "owner", "aliasMap": {"umi-owner-delenergi": "delenergi", "umi-delenergi": "delenergi", "umi-kurangenergi": "kurangenergi", "umi-removeenergi": "removeenergi", "umi-hapusenergi": "hapusenergi", "umi-delenergy": "delenergy", "delenergi": "delenergi", "kurangenergi": "kurangenergi", "removeenergi": "removeenergi", "hapusenergi": "hapusenergi", "delenergy": "delenergy"}, "description": "Kurangi energi user", "usage": ".delenergi <jumlah> @user", "example": ".delenergi 50 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/delenergi.js", metadata, m, extra)
handler.help = ["umi-owner-delenergi <jumlah> @user"]
handler.command = ["umi-owner-delenergi", "umi-delenergi", "umi-kurangenergi", "umi-removeenergi", "umi-hapusenergi", "umi-delenergy", "delenergi", "kurangenergi", "removeenergi", "hapusenergi", "delenergy"]
handler.tags = ["owner"]
handler.description = "Kurangi energi user"
handler.importSource = "umi"
handler.importConfig = {"name": "delenergi", "alias": ["kurangenergi", "removeenergi", "hapusenergi", "delenergy"], "category": "owner", "description": "Kurangi energi user", "usage": ".delenergi <jumlah> @user", "example": ".delenergi 50 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-delenergi": "delenergi", "umi-delenergi": "delenergi", "umi-kurangenergi": "kurangenergi", "umi-removeenergi": "removeenergi", "umi-hapusenergi": "hapusenergi", "umi-delenergy": "delenergy", "delenergi": "delenergi", "kurangenergi": "kurangenergi", "removeenergi": "removeenergi", "hapusenergi": "hapusenergi", "delenergy": "delenergy"}
export default handler
