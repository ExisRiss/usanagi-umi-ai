/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "templateplugin", "category": "owner", "aliasMap": {"umi-owner-templateplugin": "templateplugin", "umi-templateplugin": "templateplugin", "umi-tplplugin": "tplplugin", "umi-plugin-template": "plugin-template", "templateplugin": "templateplugin", "tplplugin": "tplplugin", "plugin-template": "plugin-template"}, "description": "Generate plugin template (Owner Only)", "usage": ".templateplugin", "example": ".templateplugin", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/templateplugin.js", metadata, m, extra)
handler.help = ["umi-owner-templateplugin"]
handler.command = ["umi-owner-templateplugin", "umi-templateplugin", "umi-tplplugin", "umi-plugin-template", "templateplugin", "tplplugin", "plugin-template"]
handler.tags = ["owner"]
handler.description = "Generate plugin template (Owner Only)"
handler.importSource = "umi"
handler.importConfig = {"name": "templateplugin", "alias": ["tplplugin", "plugin-template"], "category": "owner", "description": "Generate plugin template (Owner Only)", "usage": ".templateplugin", "example": ".templateplugin", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-templateplugin": "templateplugin", "umi-templateplugin": "templateplugin", "umi-tplplugin": "tplplugin", "umi-plugin-template": "plugin-template", "templateplugin": "templateplugin", "tplplugin": "tplplugin", "plugin-template": "plugin-template"}
export default handler
