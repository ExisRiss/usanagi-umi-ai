/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "setppsaluran", "category": "owner", "aliasMap": {"umi-owner-setppsaluran": "setppsaluran", "umi-setppsaluran": "setppsaluran", "umi-setppchannel": "setppchannel", "umi-ppchannel": "ppchannel", "setppsaluran": "setppsaluran", "setppchannel": "setppchannel", "ppchannel": "ppchannel"}, "description": "Ganti PP channel dan kirim notifikasi ke channel", "usage": ".setppsaluran (reply gambar)", "example": ".setppsaluran", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/setppsaluran.js", metadata, m, extra)
handler.help = ["umi-owner-setppsaluran (reply gambar)"]
handler.command = ["umi-owner-setppsaluran", "umi-setppsaluran", "umi-setppchannel", "umi-ppchannel", "setppsaluran", "setppchannel", "ppchannel"]
handler.tags = ["owner"]
handler.description = "Ganti PP channel dan kirim notifikasi ke channel"
handler.importSource = "umi"
handler.importConfig = {"name": "setppsaluran", "alias": ["setppchannel", "ppchannel"], "category": "owner", "description": "Ganti PP channel dan kirim notifikasi ke channel", "usage": ".setppsaluran (reply gambar)", "example": ".setppsaluran", "isOwner": true, "cooldown": 5, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-setppsaluran": "setppsaluran", "umi-setppsaluran": "setppsaluran", "umi-setppchannel": "setppchannel", "umi-ppchannel": "ppchannel", "setppsaluran": "setppsaluran", "setppchannel": "setppchannel", "ppchannel": "ppchannel"}
export default handler
