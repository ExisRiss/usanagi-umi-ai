import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "banana", "category": "ai", "aliasMap": {"umi-ai-banana": "banana", "umibanana": "banana", "banana": "banana"}, "description": "Edit gambar dengan AI menggunakan prompt", "usage": ".banana <prompt>", "example": ".banana make it anime style", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/rimurubanana.js", metadata, m, extra)
handler.help = ["umi-ai-banana <prompt>"]
handler.command = ["umi-ai-banana", "umibanana", "banana"]
handler.tags = ["ai"]
handler.description = "Edit gambar dengan AI menggunakan prompt"
handler.importSource = "umi"
handler.importConfig = {"name": "banana", "alias": [], "category": "ai", "description": "Edit gambar dengan AI menggunakan prompt", "usage": ".banana <prompt>", "example": ".banana make it anime style", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-banana": "banana", "umibanana": "banana", "banana": "banana"}
export default handler
