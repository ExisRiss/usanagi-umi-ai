import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "bratvid2", "category": "sticker", "aliasMap": {"umi-sticker-bratvid2": "bratvid2", "umi-bratvid2": "bratvid2", "umi-bratv2": "bratv2", "bratv2": "bratv2"}, "description": "Generate brat video v2", "usage": ".bratvid2 <text>", "example": ".bratvid2 hello world", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/sticker/bratvid2.js", metadata, m, extra)
handler.help = ["umi-sticker-bratvid2 <text>"]
handler.command = ["umi-sticker-bratvid2", "umi-bratvid2", "umi-bratv2", "bratv2"]
handler.tags = ["sticker"]
handler.description = "Generate brat video v2"
handler.importSource = "umi"
handler.importConfig = {"name": "bratvid2", "alias": ["bratv2"], "category": "sticker", "description": "Generate brat video v2", "usage": ".bratvid2 <text>", "example": ".bratvid2 hello world", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-sticker-bratvid2": "bratvid2", "umi-bratvid2": "bratvid2", "umi-bratv2": "bratv2", "bratv2": "bratv2"}
export default handler
