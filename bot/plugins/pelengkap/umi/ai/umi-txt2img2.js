/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "text2img4", "category": "ai", "aliasMap": {"umi-ai-text2img4": "text2img4", "umi-text2img4": "text2img4", "umi-imggen2": "imggen2", "umi-flux": "flux", "text2img4": "text2img4", "imggen2": "imggen2"}, "description": "Buat gambar dari teks pakai Flux Klein 4B", "usage": ".txt2img2 <deskripsi gambar>", "example": ".txt2img2 Mobil Lamborghini revuelto", "cooldown": 30, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/txt2img2.js", metadata, m, extra)
handler.help = ["umi-ai-text2img4 <deskripsi gambar>"]
handler.command = ["umi-ai-text2img4", "umi-text2img4", "umi-imggen2", "umi-flux", "text2img4", "imggen2"]
handler.tags = ["ai"]
handler.description = "Buat gambar dari teks pakai Flux Klein 4B"
handler.importSource = "umi"
handler.importConfig = {"name": "text2img4", "alias": ["t2i2", "imggen2", "flux"], "category": "ai", "description": "Buat gambar dari teks pakai Flux Klein 4B", "usage": ".txt2img2 <deskripsi gambar>", "example": ".txt2img2 Mobil Lamborghini revuelto", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 30, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-text2img4": "text2img4", "umi-text2img4": "text2img4", "umi-imggen2": "imggen2", "umi-flux": "flux", "text2img4": "text2img4", "imggen2": "imggen2"}
export default handler
