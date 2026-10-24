/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "addsewa", "category": "owner", "aliasMap": {"umi-owner-addsewa": "addsewa", "umi-addsewa": "addsewa", "umi-sewaadd": "sewaadd", "umi-tambahsewa": "tambahsewa", "addsewa": "addsewa", "sewaadd": "sewaadd", "tambahsewa": "tambahsewa"}, "description": "Tambah grup ke whitelist sewa + auto join", "usage": ".addsewa <link/id grup> <durasi>", "example": ".addsewa https://chat.whatsapp.com/xxx 30d", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/addsewa.js", metadata, m, extra)
handler.help = ["umi-owner-addsewa <link/id grup> <durasi>"]
handler.command = ["umi-owner-addsewa", "umi-addsewa", "umi-sewaadd", "umi-tambahsewa", "addsewa", "sewaadd", "tambahsewa"]
handler.tags = ["owner"]
handler.description = "Tambah grup ke whitelist sewa + auto join"
handler.importSource = "umi"
handler.importConfig = {"name": "addsewa", "alias": ["sewaadd", "tambahsewa"], "category": "owner", "description": "Tambah grup ke whitelist sewa + auto join", "usage": ".addsewa <link/id grup> <durasi>", "example": ".addsewa https://chat.whatsapp.com/xxx 30d", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-addsewa": "addsewa", "umi-addsewa": "addsewa", "umi-sewaadd": "sewaadd", "umi-tambahsewa": "tambahsewa", "addsewa": "addsewa", "sewaadd": "sewaadd", "tambahsewa": "tambahsewa"}
export default handler
