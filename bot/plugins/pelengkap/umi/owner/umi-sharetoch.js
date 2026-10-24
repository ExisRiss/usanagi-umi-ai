/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sharetoch", "category": "owner", "aliasMap": {"umi-owner-sharetoch": "sharetoch", "umi-sharetoch": "sharetoch", "umi-sharetosaluran": "sharetosaluran", "sharetoch": "sharetoch", "sharetosaluran": "sharetosaluran"}, "description": "Share ke channel tanpa watermark", "usage": ".sharetoch (reply pesan)", "example": ".sharetoch", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/sharetoch.js", metadata, m, extra)
handler.help = ["umi-owner-sharetoch (reply pesan)"]
handler.command = ["umi-owner-sharetoch", "umi-sharetoch", "umi-sharetosaluran", "sharetoch", "sharetosaluran"]
handler.tags = ["owner"]
handler.description = "Share ke channel tanpa watermark"
handler.importSource = "umi"
handler.importConfig = {"name": "sharetoch", "alias": ["sharetosaluran"], "category": "owner", "description": "Share ke channel tanpa watermark", "usage": ".sharetoch (reply pesan)", "example": ".sharetoch", "isOwner": true, "cooldown": 3, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-sharetoch": "sharetoch", "umi-sharetoch": "sharetoch", "umi-sharetosaluran": "sharetosaluran", "sharetoch": "sharetoch", "sharetosaluran": "sharetosaluran"}
export default handler
