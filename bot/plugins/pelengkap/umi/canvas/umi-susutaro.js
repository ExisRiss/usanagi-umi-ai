/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "susutaro", "category": "canvas", "aliasMap": {"umi-canvas-susutaro": "susutaro", "umi-susutaro": "susutaro", "umi-taro": "taro", "susutaro": "susutaro", "taro": "taro"}, "description": "Memberikan efek Susu Taro pada gambar", "usage": ".susutaro <reply image>", "example": ".susutaro", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/susutaro.js", metadata, m, extra)
handler.help = ["umi-canvas-susutaro <reply image>"]
handler.command = ["umi-canvas-susutaro", "umi-susutaro", "umi-taro", "susutaro", "taro"]
handler.tags = ["canvas"]
handler.description = "Memberikan efek Susu Taro pada gambar"
handler.importSource = "umi"
handler.importConfig = {"name": "susutaro", "alias": ["taro"], "category": "canvas", "description": "Memberikan efek Susu Taro pada gambar", "usage": ".susutaro <reply image>", "example": ".susutaro", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-susutaro": "susutaro", "umi-susutaro": "susutaro", "umi-taro": "taro", "susutaro": "susutaro", "taro": "taro"}
export default handler
