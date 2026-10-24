import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dafont", "category": "tools", "aliasMap": {"umi-tools-dafont": "dafont", "umi-daffont": "daffont", "umi-carifont": "carifont", "daffont": "daffont", "carifont": "carifont"}, "description": "Cari dan download font dari DaFont", "usage": ".dafont <nama font>", "example": ".dafont arial", "cooldown": 10, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/dafont.js", metadata, m, extra)
handler.help = ["umi-tools-dafont <nama font>"]
handler.command = ["umi-tools-dafont", "umi-daffont", "umi-carifont", "daffont", "carifont"]
handler.tags = ["tools"]
handler.description = "Cari dan download font dari DaFont"
handler.importSource = "umi"
handler.importConfig = {"name": "dafont", "alias": ["font", "daffont", "carifont"], "category": "tools", "description": "Cari dan download font dari DaFont", "usage": ".dafont <nama font>", "example": ".dafont arial", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-dafont": "dafont", "umi-daffont": "daffont", "umi-carifont": "carifont", "daffont": "daffont", "carifont": "carifont"}
export default handler
