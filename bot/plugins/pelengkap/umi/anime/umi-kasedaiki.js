import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "kasedaiki", "category": "anime", "aliasMap": {"umi-anime-kasedaiki": "kasedaiki", "umi-kasedaiki": "kasedaiki", "umi-kasedai": "kasedai", "umi-aiki": "aiki", "kasedaiki": "kasedaiki", "kasedai": "kasedai", "aiki": "aiki"}, "description": "Kirim gambar random kasedaiki", "usage": ".kasedaiki", "example": ".kasedaiki", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/kasedaiki.js", metadata, m, extra)
handler.help = ["umi-anime-kasedaiki"]
handler.command = ["umi-anime-kasedaiki", "umi-kasedaiki", "umi-kasedai", "umi-aiki", "kasedaiki", "kasedai", "aiki"]
handler.tags = ["anime"]
handler.description = "Kirim gambar random kasedaiki"
handler.importSource = "umi"
handler.importConfig = {"name": "kasedaiki", "alias": ["kasedai", "aiki"], "category": "anime", "description": "Kirim gambar random kasedaiki", "usage": ".kasedaiki", "example": ".kasedaiki", "isOwner": false, "isPremium": true, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = true
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-anime-kasedaiki": "kasedaiki", "umi-kasedaiki": "kasedaiki", "umi-kasedai": "kasedai", "umi-aiki": "aiki", "kasedaiki": "kasedaiki", "kasedai": "kasedai", "aiki": "aiki"}
export default handler
