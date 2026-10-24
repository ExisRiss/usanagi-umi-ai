import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antidocument", "category": "group", "aliasMap": {"umi-group-antidocument": "antidocument", "umi-antidocument": "antidocument", "umi-antidoc": "antidoc", "umi-nodocument": "nodocument", "umi-nodoc": "nodoc", "antidocument": "antidocument", "antidoc": "antidoc", "nodocument": "nodocument", "nodoc": "nodoc"}, "description": "Mengatur antidocument di grup", "usage": ".antidocument <on/off>", "example": ".antidocument on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antidocument.js", metadata, m, extra)
handler.help = ["umi-group-antidocument <on/off>"]
handler.command = ["umi-group-antidocument", "umi-antidocument", "umi-antidoc", "umi-nodocument", "umi-nodoc", "antidocument", "antidoc", "nodocument", "nodoc"]
handler.tags = ["group"]
handler.description = "Mengatur antidocument di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antidocument", "alias": ["antidoc", "nodocument", "nodoc"], "category": "group", "description": "Mengatur antidocument di grup", "usage": ".antidocument <on/off>", "example": ".antidocument on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "isBotAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antidocument": "antidocument", "umi-antidocument": "antidocument", "umi-antidoc": "antidoc", "umi-nodocument": "nodocument", "umi-nodoc": "nodoc", "antidocument": "antidocument", "antidoc": "antidoc", "nodocument": "nodocument", "nodoc": "nodoc"}
export default handler
