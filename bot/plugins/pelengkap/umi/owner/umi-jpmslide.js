/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "jpmslide", "category": "owner", "aliasMap": {"umi-owner-jpmslide": "jpmslide", "umi-jpmslide": "jpmslide", "jpmslide": "jpmslide"}, "description": "JPM carousel/slide ke semua grup yang diikuti bot", "usage": ".jpmslide", "example": ".jpmslide", "cooldown": 30, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/jpmslide.js", metadata, m, extra)
handler.help = ["umi-owner-jpmslide"]
handler.command = ["umi-owner-jpmslide", "umi-jpmslide", "jpmslide"]
handler.tags = ["owner"]
handler.description = "JPM carousel/slide ke semua grup yang diikuti bot"
handler.importSource = "umi"
handler.importConfig = {"name": "jpmslide", "alias": [], "category": "owner", "description": "JPM carousel/slide ke semua grup yang diikuti bot", "usage": ".jpmslide", "example": ".jpmslide", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-jpmslide": "jpmslide", "umi-jpmslide": "jpmslide", "jpmslide": "jpmslide"}
export default handler
