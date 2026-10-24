import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "simi2", "category": "fun", "aliasMap": {"umi-fun-simi2": "simi2", "umi-simi2": "simi2", "umi-simisimi2": "simisimi2", "simi2": "simi2", "simisimi2": "simisimi2"}, "description": "Simi chat variant dari Tensura.", "usage": ".simi2 <teks>", "example": ".simi2 <teks>", "cooldown": 5, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/simi2.js", metadata, m, extra)
handler.help = ["umi-fun-simi2 <teks>"]
handler.command = ["umi-fun-simi2", "umi-simi2", "umi-simisimi2", "simi2", "simisimi2"]
handler.tags = ["fun"]
handler.description = "Simi chat variant dari Tensura."
handler.importSource = "umi"
handler.importConfig = {"name": "simi2", "alias": ["simisimi2"], "category": "fun", "description": "Simi chat variant dari Tensura.", "usage": ".simi2 <teks>", "example": ".simi2 <teks>", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-fun-simi2": "simi2", "umi-simi2": "simi2", "umi-simisimi2": "simisimi2", "simi2": "simi2", "simisimi2": "simisimi2"}
export default handler
