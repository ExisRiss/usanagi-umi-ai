import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "banana2", "category": "ai", "aliasMap": {"umi-ai-banana2": "banana2", "umibanana2": "banana2", "banana2": "banana2"}, "description": "Buat gambar dengan AI menggunakan prompt", "usage": ".banana2 <prompt>", "example": ".banana2 make it anime style", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/rimurubanana2.js", metadata, m, extra)
handler.help = ["umi-ai-banana2 <prompt>"]
handler.command = ["umi-ai-banana2", "umibanana2", "banana2"]
handler.tags = ["ai"]
handler.description = "Buat gambar dengan AI menggunakan prompt"
handler.importSource = "umi"
handler.importConfig = {"name": "banana2", "alias": [], "category": "ai", "description": "Buat gambar dengan AI menggunakan prompt", "usage": ".banana2 <prompt>", "example": ".banana2 make it anime style", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-banana2": "banana2", "umibanana2": "banana2", "banana2": "banana2"}
export default handler
