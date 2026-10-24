/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "nanobanana", "category": "ai", "aliasMap": {"umi-ai-nanobanana": "nanobanana", "umi-nanobanana": "nanobanana", "umi-nano": "nano", "umi-imgedit": "imgedit", "nano": "nano", "imgedit": "imgedit"}, "description": "Edit gambar dengan AI menggunakan prompt", "usage": ".nanobanana <prompt>", "example": ".nanobanana make it anime style", "cooldown": 30, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/nanobanana.js", metadata, m, extra)
handler.help = ["umi-ai-nanobanana <prompt>"]
handler.command = ["umi-ai-nanobanana", "umi-nanobanana", "umi-nano", "umi-imgedit", "nano", "imgedit"]
handler.tags = ["ai"]
handler.description = "Edit gambar dengan AI menggunakan prompt"
handler.importSource = "umi"
handler.importConfig = {"name": "nanobanana", "alias": ["nano", "imgedit"], "category": "ai", "description": "Edit gambar dengan AI menggunakan prompt", "usage": ".nanobanana <prompt>", "example": ".nanobanana make it anime style", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-nanobanana": "nanobanana", "umi-nanobanana": "nanobanana", "umi-nano": "nano", "umi-imgedit": "imgedit", "nano": "nano", "imgedit": "imgedit"}
export default handler
