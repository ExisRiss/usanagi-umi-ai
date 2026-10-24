import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "caribug", "category": "tools", "aliasMap": {"umi-tools-caribug": "caribug", "umi-caribug": "caribug", "umi-debug": "debug", "umi-findbug": "findbug", "caribug": "caribug", "debug": "debug", "findbug": "findbug"}, "description": "Cari bug di kode pemrograman", "usage": ".caribug [kode] atau reply kode", "example": ".caribug function test() {}", "cooldown": 20, "energi": 1}
const handler = (m, extra) => runImportedFeature("umi", "plugins/tools/caribug.js", metadata, m, extra)
handler.help = ["umi-tools-caribug [kode] atau reply kode"]
handler.command = ["umi-tools-caribug", "umi-caribug", "umi-debug", "umi-findbug", "caribug", "debug", "findbug"]
handler.tags = ["tools"]
handler.description = "Cari bug di kode pemrograman"
handler.importSource = "umi"
handler.importConfig = {"name": "caribug", "alias": ["debug", "findbug"], "category": "tools", "description": "Cari bug di kode pemrograman", "usage": ".caribug [kode] atau reply kode", "example": ".caribug function test() {}", "cooldown": 20, "energi": 1, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-tools-caribug": "caribug", "umi-caribug": "caribug", "umi-debug": "debug", "umi-findbug": "findbug", "caribug": "caribug", "debug": "debug", "findbug": "findbug"}
export default handler
