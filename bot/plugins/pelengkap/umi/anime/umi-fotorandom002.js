import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "fotorandom002", "category": "anime", "aliasMap": {"umi-anime-fotorandom002": "fotorandom002", "umi-fotorandom002": "fotorandom002", "umi-fotoumi": "fotoumi", "umi-randomfotozero": "randomfotozero", "fotorandom002": "fotorandom002", "fotoumi": "fotoumi", "randomfotozero": "randomfotozero"}, "description": "Umi random image 💗", "usage": ".foto-randomumi", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/anime/fotorandom002.js", metadata, m, extra)
handler.help = ["umi-anime-fotorandom002"]
handler.command = ["umi-anime-fotorandom002", "umi-fotorandom002", "umi-fotoumi", "umi-randomfotozero", "fotorandom002", "fotoumi", "randomfotozero"]
handler.tags = ["anime"]
handler.description = "Umi random image 💗"
handler.importSource = "umi"
handler.importConfig = {"name": "fotorandom002", "alias": ["fotoumi", "randomfotozero"], "category": "anime", "description": "Umi random image 💗", "usage": ".foto-randomumi", "isEnabled": true, "cooldown": 5}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-anime-fotorandom002": "fotorandom002", "umi-fotorandom002": "fotorandom002", "umi-fotoumi": "fotoumi", "umi-randomfotozero": "randomfotozero", "fotorandom002": "fotorandom002", "fotoumi": "fotoumi", "randomfotozero": "randomfotozero"}
export default handler
