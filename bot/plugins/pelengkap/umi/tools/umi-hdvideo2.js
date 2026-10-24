/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "hdvideo2", "category": "tools", "aliasMap": {"umi-tools-hdvideo2": "hdvideo2", "umi-hdvideo2": "hdvideo2", "umi-enhancevideo2": "enhancevideo2", "umi-videohd2": "videohd2", "umi-videoenhance2": "videoenhance2", "umi-video2k2": "video2k2", "hdvideo2": "hdvideo2", "enhancevideo2": "enhancevideo2", "videohd2": "videohd2", "videoenhance2": "videoenhance2", "video2k2": "video2k2"}, "description": "Enhance/upscale video ke kualitas 2K dengan AI", "usage": ".hdvideo (reply video)", "example": ".hdvideo", "cooldown": 180, "energi": 10}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/hdvideo2.js", metadata, m, extra)
handler.help = ["umi-tools-hdvideo2 (reply video)"]
handler.command = ["umi-tools-hdvideo2", "umi-hdvideo2", "umi-enhancevideo2", "umi-videohd2", "umi-videoenhance2", "umi-video2k2", "hdvideo2", "enhancevideo2", "videohd2", "videoenhance2", "video2k2"]
handler.tags = ["tools"]
handler.description = "Enhance/upscale video ke kualitas 2K dengan AI"
handler.importSource = "umi"
handler.importConfig = {"name": "hdvideo2", "alias": ["enhancevideo2", "videohd2", "videoenhance2", "video2k2"], "category": "tools", "description": "Enhance/upscale video ke kualitas 2K dengan AI", "usage": ".hdvideo (reply video)", "example": ".hdvideo", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 180, "energi": 10, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-hdvideo2": "hdvideo2", "umi-hdvideo2": "hdvideo2", "umi-enhancevideo2": "enhancevideo2", "umi-videohd2": "videohd2", "umi-videoenhance2": "videoenhance2", "umi-video2k2": "video2k2", "hdvideo2": "hdvideo2", "enhancevideo2": "enhancevideo2", "videohd2": "videohd2", "videoenhance2": "videoenhance2", "video2k2": "video2k2"}
export default handler
