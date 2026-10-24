import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "meme2", "category": "canvas", "aliasMap": {"umi-canvas-meme2": "meme2", "umi-meme2": "meme2", "umi-changemymind": "changemymind", "meme2": "meme2", "changemymind": "changemymind"}, "description": "Membuat meme change my mind", "usage": ".meme2 <teks>", "example": ".meme2 Tahu bacem enak banget", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/canvas/meme2.js", metadata, m, extra)
handler.help = ["umi-canvas-meme2 <teks>"]
handler.command = ["umi-canvas-meme2", "umi-meme2", "umi-changemymind", "meme2", "changemymind"]
handler.tags = ["canvas"]
handler.description = "Membuat meme change my mind"
handler.importSource = "umi"
handler.importConfig = {"name": "meme2", "alias": ["changemymind"], "category": "canvas", "description": "Membuat meme change my mind", "usage": ".meme2 <teks>", "example": ".meme2 Tahu bacem enak banget", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-canvas-meme2": "meme2", "umi-meme2": "meme2", "umi-changemymind": "changemymind", "meme2": "meme2", "changemymind": "changemymind"}
export default handler
