/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "swgcv2all", "category": "owner", "aliasMap": {"umi-owner-swgcv2all": "swgcv2all", "umi-swgcv2all": "swgcv2all", "umi-statusgrupv2all": "statusgrupv2all", "swgcv2all": "swgcv2all", "statusgrupv2all": "statusgrupv2all"}, "description": "Post Group Status V2 ke SEMUA grup", "usage": ".swgcv2all <teks> atau reply media", "example": ".swgcv2all Halo semua grup!", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/swgcv2all.js", metadata, m, extra)
handler.help = ["umi-owner-swgcv2all <teks> atau reply media"]
handler.command = ["umi-owner-swgcv2all", "umi-swgcv2all", "umi-statusgrupv2all", "swgcv2all", "statusgrupv2all"]
handler.tags = ["owner"]
handler.description = "Post Group Status V2 ke SEMUA grup"
handler.importSource = "umi"
handler.importConfig = {"name": "swgcv2all", "alias": ["statusgrupv2all"], "category": "owner", "description": "Post Group Status V2 ke SEMUA grup", "usage": ".swgcv2all <teks> atau reply media", "example": ".swgcv2all Halo semua grup!", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-swgcv2all": "swgcv2all", "umi-swgcv2all": "swgcv2all", "umi-statusgrupv2all": "statusgrupv2all", "swgcv2all": "swgcv2all", "statusgrupv2all": "statusgrupv2all"}
export default handler
