import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "botafk", "category": "owner", "aliasMap": {"umi-owner-botafk": "botafk", "umi-botafk": "botafk", "umi-afkbot": "afkbot", "umi-afkmode": "afkmode", "botafk": "botafk", "afkbot": "afkbot", "afkmode": "afkmode"}, "description": "Mode AFK untuk bot - bot tidak merespon command, hanya reply pesan AFK", "usage": ".botafk <alasan>", "example": ".botafk Lagi istirahat", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/botafk.js", metadata, m, extra)
handler.help = ["umi-owner-botafk <alasan>"]
handler.command = ["umi-owner-botafk", "umi-botafk", "umi-afkbot", "umi-afkmode", "botafk", "afkbot", "afkmode"]
handler.tags = ["owner"]
handler.description = "Mode AFK untuk bot - bot tidak merespon command, hanya reply pesan AFK"
handler.importSource = "umi"
handler.importConfig = {"name": "botafk", "alias": ["afkbot", "afkmode"], "category": "owner", "description": "Mode AFK untuk bot - bot tidak merespon command, hanya reply pesan AFK", "usage": ".botafk <alasan>", "example": ".botafk Lagi istirahat", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-botafk": "botafk", "umi-botafk": "botafk", "umi-afkbot": "afkbot", "umi-afkmode": "afkmode", "botafk": "botafk", "afkbot": "afkbot", "afkmode": "afkmode"}
export default handler
