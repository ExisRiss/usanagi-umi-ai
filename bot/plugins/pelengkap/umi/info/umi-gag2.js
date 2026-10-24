import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gag2", "category": "info", "aliasMap": {"umi-info-gag2": "gag2", "umi-gag2": "gag2", "umi-growagarden2": "growagarden2", "gag2": "gag2", "growagarden2": "growagarden2"}, "description": "Cek stock Grow a Garden dengan fitur watch", "usage": ".gag2 [watch] [item]", "example": ".gag2 watch seed", "cooldown": 15, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/gag2.js", metadata, m, extra)
handler.help = ["umi-info-gag2 [watch] [item]"]
handler.command = ["umi-info-gag2", "umi-gag2", "umi-growagarden2", "gag2", "growagarden2"]
handler.tags = ["info"]
handler.description = "Cek stock Grow a Garden dengan fitur watch"
handler.importSource = "umi"
handler.importConfig = {"name": "gag2", "alias": ["growagarden2"], "category": "info", "description": "Cek stock Grow a Garden dengan fitur watch", "usage": ".gag2 [watch] [item]", "example": ".gag2 watch seed", "cooldown": 15, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-gag2": "gag2", "umi-gag2": "gag2", "umi-growagarden2": "growagarden2", "gag2": "gag2", "growagarden2": "growagarden2"}
export default handler
