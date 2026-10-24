/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "antitagsw", "category": "group", "aliasMap": {"umi-group-antitagsw": "antitagsw", "umi-antitagsw": "antitagsw", "umi-antitag": "antitag", "umi-antistatustag": "antistatustag"}, "description": "Mengaktifkan/menonaktifkan anti tag status di grup", "usage": ".antitagsw <on/off>", "example": ".antitagsw on", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/antitagsw.js", metadata, m, extra)
handler.help = ["umi-group-antitagsw <on/off>"]
handler.command = ["umi-group-antitagsw", "umi-antitagsw", "umi-antitag", "umi-antistatustag"]
handler.tags = ["group"]
handler.description = "Mengaktifkan/menonaktifkan anti tag status di grup"
handler.importSource = "umi"
handler.importConfig = {"name": "antitagsw", "alias": ["antitag", "antistatustag"], "category": "group", "description": "Mengaktifkan/menonaktifkan anti tag status di grup", "usage": ".antitagsw <on/off>", "example": ".antitagsw on", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true, "isAdmin": true, "isBotAdmin": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-antitagsw": "antitagsw", "umi-antitagsw": "antitagsw", "umi-antitag": "antitag", "umi-antistatustag": "antistatustag"}
export default handler
