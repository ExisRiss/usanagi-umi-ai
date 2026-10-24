import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "test", "category": "test", "aliasMap": {"umi-test-test": "test", "umi-test": "test"}, "description": "Test Poll Menu Interaktif", "usage": ".poll", "example": ".poll", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/main/test.js", metadata, m, extra)
handler.help = ["umi-test-test"]
handler.command = ["umi-test-test", "umi-test"]
handler.tags = ["test"]
handler.description = "Test Poll Menu Interaktif"
handler.importSource = "umi"
handler.importConfig = {"name": "test", "alias": ["poll"], "category": "test", "description": "Test Poll Menu Interaktif", "usage": ".poll", "example": ".poll", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-test-test": "test", "umi-test": "test"}
export default handler
