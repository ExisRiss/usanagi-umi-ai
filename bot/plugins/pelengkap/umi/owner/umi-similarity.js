import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "similarity", "category": "owner", "aliasMap": {"umi-owner-similarity": "similarity", "umi-similarity": "similarity", "umi-setsimilarity": "setsimilarity", "umi-sim": "sim", "similarity": "similarity", "setsimilarity": "setsimilarity", "sim": "sim"}, "description": "Mengaktifkan/menonaktifkan fitur similarity (saran typo)", "usage": ".similarity <on/off>", "example": ".similarity on", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/similarity.js", metadata, m, extra)
handler.help = ["umi-owner-similarity <on/off>"]
handler.command = ["umi-owner-similarity", "umi-similarity", "umi-setsimilarity", "umi-sim", "similarity", "setsimilarity", "sim"]
handler.tags = ["owner"]
handler.description = "Mengaktifkan/menonaktifkan fitur similarity (saran typo)"
handler.importSource = "umi"
handler.importConfig = {"name": "similarity", "alias": ["setsimilarity", "sim"], "category": "owner", "description": "Mengaktifkan/menonaktifkan fitur similarity (saran typo)", "usage": ".similarity <on/off>", "example": ".similarity on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-similarity": "similarity", "umi-similarity": "similarity", "umi-setsimilarity": "setsimilarity", "umi-sim": "sim", "similarity": "similarity", "setsimilarity": "setsimilarity", "sim": "sim"}
export default handler
