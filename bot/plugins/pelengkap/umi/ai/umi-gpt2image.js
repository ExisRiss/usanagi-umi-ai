import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gpt2image", "category": "ai", "aliasMap": {"umi-ai-gpt2image": "gpt2image", "umi-gpt2image": "gpt2image", "umi-gptimg2img": "gptimg2img", "umi-image2image": "image2image", "gpt2image": "gpt2image", "gptimg2img": "gptimg2img", "image2image": "image2image"}, "description": "Image-to-image memakai GPT2Image", "usage": ".gpt2image <prompt> (reply gambar)", "example": ".gpt2image ubah jadi style anime", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/gpt2image.js", metadata, m, extra)
handler.help = ["umi-ai-gpt2image <prompt> (reply gambar)"]
handler.command = ["umi-ai-gpt2image", "umi-gpt2image", "umi-gptimg2img", "umi-image2image", "gpt2image", "gptimg2img", "image2image"]
handler.tags = ["ai"]
handler.description = "Image-to-image memakai GPT2Image"
handler.importSource = "umi"
handler.importConfig = {"name": "gpt2image", "alias": ["gptimg2img", "image2image"], "category": "ai", "description": "Image-to-image memakai GPT2Image", "usage": ".gpt2image <prompt> (reply gambar)", "example": ".gpt2image ubah jadi style anime", "isPremium": true, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-gpt2image": "gpt2image", "umi-gpt2image": "gpt2image", "umi-gptimg2img": "gptimg2img", "umi-image2image": "image2image", "gpt2image": "gpt2image", "gptimg2img": "gptimg2img", "image2image": "image2image"}
export default handler
