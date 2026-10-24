import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "cinematic", "category": "maker", "aliasMap": {"umi-maker-cinematic": "cinematic", "umi-cinematic": "cinematic", "umi-moody": "moody", "umi-darktone": "darktone", "umi-nighttone": "nighttone", "umi-filterdark": "filterdark", "umi-flashmood": "flashmood", "cinematic": "cinematic", "moody": "moody", "darktone": "darktone", "nighttone": "nighttone", "filterdark": "filterdark", "flashmood": "flashmood"}, "description": "Mengubah foto biasa menjadi Cinematic Dark Retro Flash Tone presisi", "usage": ".cinematic (Kirim/Reply Foto)", "example": ".cinematic"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/maker/cinematic.js", metadata, m, extra)
handler.help = ["umi-maker-cinematic (Kirim/Reply Foto)"]
handler.command = ["umi-maker-cinematic", "umi-cinematic", "umi-moody", "umi-darktone", "umi-nighttone", "umi-filterdark", "umi-flashmood", "cinematic", "moody", "darktone", "nighttone", "filterdark", "flashmood"]
handler.tags = ["maker"]
handler.description = "Mengubah foto biasa menjadi Cinematic Dark Retro Flash Tone presisi"
handler.importSource = "umi"
handler.importConfig = {"name": "cinematic", "alias": ["moody", "darktone", "nighttone", "filterdark", "flashmood"], "category": "maker", "description": "Mengubah foto biasa menjadi Cinematic Dark Retro Flash Tone presisi", "usage": ".cinematic (Kirim/Reply Foto)", "example": ".cinematic", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-maker-cinematic": "cinematic", "umi-cinematic": "cinematic", "umi-moody": "moody", "umi-darktone": "darktone", "umi-nighttone": "nighttone", "umi-filterdark": "filterdark", "umi-flashmood": "flashmood", "cinematic": "cinematic", "moody": "moody", "darktone": "darktone", "nighttone": "nighttone", "filterdark": "filterdark", "flashmood": "flashmood"}
export default handler
