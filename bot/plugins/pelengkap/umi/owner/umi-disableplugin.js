import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "disableplugin", "category": "owner", "aliasMap": {"umi-owner-disableplugin": "disableplugin", "umi-disableplugin": "disableplugin", "umi-dplugin": "dplugin", "umi-plugindisable": "plugindisable", "umi-offplugin": "offplugin", "disableplugin": "disableplugin", "dplugin": "dplugin", "plugindisable": "plugindisable", "offplugin": "offplugin"}, "description": "Menonaktifkan plugin tertentu", "usage": ".disableplugin <nama_plugin>", "example": ".disableplugin sticker", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/disableplugin.js", metadata, m, extra)
handler.help = ["umi-owner-disableplugin <nama_plugin>"]
handler.command = ["umi-owner-disableplugin", "umi-disableplugin", "umi-dplugin", "umi-plugindisable", "umi-offplugin", "disableplugin", "dplugin", "plugindisable", "offplugin"]
handler.tags = ["owner"]
handler.description = "Menonaktifkan plugin tertentu"
handler.importSource = "umi"
handler.importConfig = {"name": "disableplugin", "alias": ["dplugin", "plugindisable", "offplugin"], "category": "owner", "description": "Menonaktifkan plugin tertentu", "usage": ".disableplugin <nama_plugin>", "example": ".disableplugin sticker", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-disableplugin": "disableplugin", "umi-disableplugin": "disableplugin", "umi-dplugin": "dplugin", "umi-plugindisable": "plugindisable", "umi-offplugin": "offplugin", "disableplugin": "disableplugin", "dplugin": "dplugin", "plugindisable": "plugindisable", "offplugin": "offplugin"}
export default handler
