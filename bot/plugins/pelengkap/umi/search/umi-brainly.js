import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "brainly", "category": "search", "aliasMap": {"umi-search-brainly": "brainly", "umi-brainly": "brainly", "umi-brain": "brain", "umi-jawab": "jawab", "brainly": "brainly", "brain": "brain", "jawab": "jawab"}, "description": "Cari jawaban di Brainly", "usage": ".brainly <pertanyaan>", "example": ".brainly 1+1", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/search/brainly.js", metadata, m, extra)
handler.help = ["umi-search-brainly <pertanyaan>"]
handler.command = ["umi-search-brainly", "umi-brainly", "umi-brain", "umi-jawab", "brainly", "brain", "jawab"]
handler.tags = ["search"]
handler.description = "Cari jawaban di Brainly"
handler.importSource = "umi"
handler.importConfig = {"name": "brainly", "alias": ["brain", "jawab"], "category": "search", "description": "Cari jawaban di Brainly", "usage": ".brainly <pertanyaan>", "example": ".brainly 1+1", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-search-brainly": "brainly", "umi-brainly": "brainly", "umi-brain": "brain", "umi-jawab": "jawab", "brainly": "brainly", "brain": "brain", "jawab": "jawab"}
export default handler
