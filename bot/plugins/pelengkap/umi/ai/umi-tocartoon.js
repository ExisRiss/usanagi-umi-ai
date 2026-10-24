/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "tocartoon", "category": "ai", "aliasMap": {"umi-ai-tocartoon": "tocartoon", "umi-tocartoon": "tocartoon", "umi-cartoon": "cartoon", "umi-cartoonify": "cartoonify", "umi-tooncartoon": "tooncartoon", "tocartoon": "tocartoon", "cartoon": "cartoon", "cartoonify": "cartoonify", "tooncartoon": "tooncartoon"}, "description": "Ubah foto menjadi gaya kartun", "usage": ".tocartoon (reply/kirim gambar)", "example": ".tocartoon", "cooldown": 60, "energi": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/ai/tocartoon.js", metadata, m, extra)
handler.help = ["umi-ai-tocartoon (reply/kirim gambar)"]
handler.command = ["umi-ai-tocartoon", "umi-tocartoon", "umi-cartoon", "umi-cartoonify", "umi-tooncartoon", "tocartoon", "cartoon", "cartoonify", "tooncartoon"]
handler.tags = ["ai"]
handler.description = "Ubah foto menjadi gaya kartun"
handler.importSource = "umi"
handler.importConfig = {"name": "tocartoon", "alias": ["cartoon", "cartoonify", "tooncartoon"], "category": "ai", "description": "Ubah foto menjadi gaya kartun", "usage": ".tocartoon (reply/kirim gambar)", "example": ".tocartoon", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 60, "energi": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-ai-tocartoon": "tocartoon", "umi-tocartoon": "tocartoon", "umi-cartoon": "cartoon", "umi-cartoonify": "cartoonify", "umi-tooncartoon": "tooncartoon", "tocartoon": "tocartoon", "cartoon": "cartoon", "cartoonify": "cartoonify", "tooncartoon": "tooncartoon"}
export default handler
