/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "creator2", "category": "main", "aliasMap": {"umi-main-creator2": "creator2", "umi-creator2": "creator2", "umi-owner2": "owner2", "creator2": "creator2", "owner2": "owner2"}, "description": "Varian kontak owner dari Tensura.", "usage": ".creator2", "example": ".creator2", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/creator2.js", metadata, m, extra)
handler.help = ["umi-main-creator2"]
handler.command = ["umi-main-creator2", "umi-creator2", "umi-owner2", "creator2", "owner2"]
handler.tags = ["main"]
handler.description = "Varian kontak owner dari Tensura."
handler.importSource = "umi"
handler.importConfig = {"name": "creator2", "alias": ["owner2"], "category": "main", "description": "Varian kontak owner dari Tensura.", "usage": ".creator2", "example": ".creator2", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-main-creator2": "creator2", "umi-creator2": "creator2", "umi-owner2": "owner2", "creator2": "creator2", "owner2": "owner2"}
export default handler
