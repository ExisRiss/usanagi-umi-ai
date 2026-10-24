import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "colongsw", "category": "tools", "aliasMap": {"umi-tools-colongsw": "colongsw", "umi-colongsw": "colongsw", "umi-ambilsw": "ambilsw", "colongsw": "colongsw", "ambilsw": "ambilsw"}, "description": "Ambil SW khusus yang mention grup", "usage": ".colongsw (reply sw mention)", "example": ".colongsw", "cooldown": 5}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/colongsw.js", metadata, m, extra)
handler.help = ["umi-tools-colongsw (reply sw mention)"]
handler.command = ["umi-tools-colongsw", "umi-colongsw", "umi-ambilsw", "colongsw", "ambilsw"]
handler.tags = ["tools"]
handler.description = "Ambil SW khusus yang mention grup"
handler.importSource = "umi"
handler.importConfig = {"name": "colongsw", "alias": ["ambilsw"], "category": "tools", "description": "Ambil SW khusus yang mention grup", "usage": ".colongsw (reply sw mention)", "example": ".colongsw", "cooldown": 5, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-tools-colongsw": "colongsw", "umi-colongsw": "colongsw", "umi-ambilsw": "ambilsw", "colongsw": "colongsw", "ambilsw": "ambilsw"}
export default handler
