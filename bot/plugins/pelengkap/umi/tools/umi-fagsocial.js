import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fagsocial", "category": "tools", "aliasMap": {"umi-tools-fagsocial": "fagsocial", "umi-fagsocial": "fagsocial", "umi-fag": "fag", "umi-ftt": "ftt", "fagsocial": "fagsocial", "fag": "fag", "ftt": "ftt"}, "description": "Mengubah Foto menjadi Overlay IG Reels (.fag) atau TikTok FYP (.ftt) dengan responsif penuh", "usage": ".fag username | caption  ATAU  .ftt username | caption", "example": ".fag dj_sagara | Chill vibes 🌲✨\n.ftt sagara_tt | FYP Hari Ini 🔥"}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/fagsocial.js", metadata, m, extra)
handler.help = ["umi-tools-fagsocial username | caption  ATAU  .ftt username | caption"]
handler.command = ["umi-tools-fagsocial", "umi-fagsocial", "umi-fag", "umi-ftt", "fagsocial", "fag", "ftt"]
handler.tags = ["tools"]
handler.description = "Mengubah Foto menjadi Overlay IG Reels (.fag) atau TikTok FYP (.ftt) dengan responsif penuh"
handler.importSource = "umi"
handler.importConfig = {"name": "fagsocial", "alias": ["fag", "ftt"], "category": "tools", "description": "Mengubah Foto menjadi Overlay IG Reels (.fag) atau TikTok FYP (.ftt) dengan responsif penuh", "usage": ".fag username | caption  ATAU  .ftt username | caption", "example": ".fag dj_sagara | Chill vibes 🌲✨\n.ftt sagara_tt | FYP Hari Ini 🔥", "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-fagsocial": "fagsocial", "umi-fagsocial": "fagsocial", "umi-fag": "fag", "umi-ftt": "ftt", "fagsocial": "fagsocial", "fag": "fag", "ftt": "ftt"}
export default handler
