import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "arta", "category": "ai", "aliasMap": {"umi-ai-arta": "arta", "umi-arta": "arta", "umi-artagen": "artagen", "umi-artai": "artai", "umi-aiarta": "aiarta", "arta": "arta", "artagen": "artagen", "artai": "artai", "aiarta": "aiarta"}, "description": "Membuat gambar AI menggunakan Arta AI Generator", "usage": ".arta Prompt | Style | Negative Prompt", "example": ".arta beautiful anime girl with katana | Katayama-mix-xl | low quality, blurry", "cooldown": 15, "energi": 2}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/artaai.js", metadata, m, extra)
handler.help = ["umi-ai-arta Prompt | Style | Negative Prompt"]
handler.command = ["umi-ai-arta", "umi-arta", "umi-artagen", "umi-artai", "umi-aiarta", "arta", "artagen", "artai", "aiarta"]
handler.tags = ["ai"]
handler.description = "Membuat gambar AI menggunakan Arta AI Generator"
handler.importSource = "umi"
handler.importConfig = {"name": "arta", "alias": ["artagen", "artai", "aiarta"], "category": "ai", "description": "Membuat gambar AI menggunakan Arta AI Generator", "usage": ".arta Prompt | Style | Negative Prompt", "example": ".arta beautiful anime girl with katana | Katayama-mix-xl | low quality, blurry", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 15, "energi": 2, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-arta": "arta", "umi-arta": "arta", "umi-artagen": "artagen", "umi-artai": "artai", "umi-aiarta": "aiarta", "arta": "arta", "artagen": "artagen", "artai": "artai", "aiarta": "aiarta"}
export default handler
