import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "gunungapi", "category": "info", "aliasMap": {"umi-info-gunungapi": "gunungapi", "umi-gunungapi": "gunungapi", "umi-magma": "magma", "umi-gunung": "gunung", "umi-erupsi": "erupsi", "umi-volcano": "volcano", "gunungapi": "gunungapi", "gunung": "gunung", "erupsi": "erupsi", "volcano": "volcano"}, "description": "Informasi aktivitas gunung api Indonesia dari MAGMA ESDM", "usage": ".magma | .magma status <kode> | .magma gunung <nama> | .magma list <halaman>", "cooldown": 5, "energi": 0, "limit": true}
const handler = (m, extra) => runImportedFeature("umi", "plugins/info/gunungapi.js", metadata, m, extra)
handler.help = ["umi-info-gunungapi | .magma status <kode> | .magma gunung <nama> | .magma list <halaman>"]
handler.command = ["umi-info-gunungapi", "umi-gunungapi", "umi-magma", "umi-gunung", "umi-erupsi", "umi-volcano", "gunungapi", "gunung", "erupsi", "volcano"]
handler.tags = ["info"]
handler.description = "Informasi aktivitas gunung api Indonesia dari MAGMA ESDM"
handler.importSource = "umi"
handler.importConfig = {"name": "gunungapi", "alias": ["magma", "gunung", "erupsi", "volcano"], "category": "info", "description": "Informasi aktivitas gunung api Indonesia dari MAGMA ESDM", "usage": ".magma | .magma status <kode> | .magma gunung <nama> | .magma list <halaman>", "cooldown": 5, "energi": 0, "limit": true, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 1
handler.importAliasMap = {"umi-info-gunungapi": "gunungapi", "umi-gunungapi": "gunungapi", "umi-magma": "magma", "umi-gunung": "gunung", "umi-erupsi": "erupsi", "umi-volcano": "volcano", "gunungapi": "gunungapi", "gunung": "gunung", "erupsi": "erupsi", "volcano": "volcano"}
export default handler
