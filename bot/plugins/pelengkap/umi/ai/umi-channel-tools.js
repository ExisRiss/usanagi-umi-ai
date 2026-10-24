/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "followch", "category": "owner", "aliasMap": {"umi-owner-followch": "followch", "umi-followch": "followch", "umi-unfollowch": "unfollowch", "umi-setnamech": "setnamech", "followch": "followch", "unfollowch": "unfollowch", "setnamech": "setnamech"}, "description": "Manajemen channel/newsletter tambahan dari Aqua", "usage": ".followch <channelJid> / .createch <nama>", "example": ".followch CHANNEL_ID", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/channel-tools.js", metadata, m, extra)
handler.help = ["umi-owner-followch <channelJid> / .createch <nama>"]
handler.command = ["umi-owner-followch", "umi-followch", "umi-unfollowch", "umi-setnamech", "followch", "unfollowch", "setnamech"]
handler.tags = ["owner"]
handler.description = "Manajemen channel/newsletter tambahan dari Aqua"
handler.importSource = "umi"
handler.importConfig = {"name": "followch", "alias": ["followch", "unfollowch", "setnamech"], "category": "owner", "description": "Manajemen channel/newsletter tambahan dari Aqua", "usage": ".followch <channelJid> / .createch <nama>", "example": ".followch CHANNEL_ID", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-followch": "followch", "umi-followch": "followch", "umi-unfollowch": "unfollowch", "umi-setnamech": "setnamech", "followch": "followch", "unfollowch": "unfollowch", "setnamech": "setnamech"}
export default handler
