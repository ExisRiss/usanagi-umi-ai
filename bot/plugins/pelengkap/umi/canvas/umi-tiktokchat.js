import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tiktokchat", "category": "canvas", "aliasMap": {"umi-canvas-tiktokchat": "tiktokchat", "umi-tiktokchat": "tiktokchat", "umi-tiktok-chat": "tiktok-chat", "umi-ttchat": "ttchat", "tiktokchat": "tiktokchat", "tiktok-chat": "tiktok-chat", "ttchat": "ttchat"}, "description": "Membuat fake chat TikTok dari avatar kamu", "usage": ".tiktokchat username | pesan (reply gambar)", "cooldown": 5, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/tiktokchat.js", metadata, m, extra)
handler.help = ["umi-canvas-tiktokchat username | pesan (reply gambar)"]
handler.command = ["umi-canvas-tiktokchat", "umi-tiktokchat", "umi-tiktok-chat", "umi-ttchat", "tiktokchat", "tiktok-chat", "ttchat"]
handler.tags = ["canvas"]
handler.description = "Membuat fake chat TikTok dari avatar kamu"
handler.importSource = "umi"
handler.importConfig = {"name": "tiktokchat", "alias": ["tiktok-chat", "ttchat"], "category": "canvas", "description": "Membuat fake chat TikTok dari avatar kamu", "usage": ".tiktokchat username | pesan (reply gambar)", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-tiktokchat": "tiktokchat", "umi-tiktokchat": "tiktokchat", "umi-tiktok-chat": "tiktok-chat", "umi-ttchat": "ttchat", "tiktokchat": "tiktokchat", "tiktok-chat": "tiktok-chat", "ttchat": "ttchat"}
export default handler
