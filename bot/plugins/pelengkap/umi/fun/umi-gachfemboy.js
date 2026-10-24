import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gachafemboy", "category": "fun", "aliasMap": {"umi-fun-gachafemboy": "gachafemboy", "umi-gachafemboy": "gachafemboy", "gachafemboy": "gachafemboy"}, "description": "Gacha femboy anime random", "usage": ".gachafemboy", "cooldown": 3}
const handler = (m, extra) => runImportedFeature("umi", "plugins/fun/gachfemboy.js", metadata, m, extra)
handler.help = ["umi-fun-gachafemboy"]
handler.command = ["umi-fun-gachafemboy", "umi-gachafemboy", "gachafemboy"]
handler.tags = ["fun"]
handler.description = "Gacha femboy anime random"
handler.importSource = "umi"
handler.importConfig = {"name": "gachafemboy", "category": "fun", "description": "Gacha femboy anime random", "usage": ".gachafemboy", "cooldown": 3, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-fun-gachafemboy": "gachafemboy", "umi-gachafemboy": "gachafemboy", "gachafemboy": "gachafemboy"}
export default handler
