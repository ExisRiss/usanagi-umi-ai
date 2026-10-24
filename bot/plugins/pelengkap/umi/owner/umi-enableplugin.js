import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "enableplugin", "category": "owner", "aliasMap": {"umi-owner-enableplugin": "enableplugin", "umi-enableplugin": "enableplugin", "umi-eplugin": "eplugin", "umi-pluginenable": "pluginenable", "umi-onplugin": "onplugin", "enableplugin": "enableplugin", "eplugin": "eplugin", "pluginenable": "pluginenable", "onplugin": "onplugin"}, "description": "Mengaktifkan kembali plugin yang dinonaktifkan", "usage": ".enableplugin <nama_plugin>", "example": ".enableplugin sticker", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/enableplugin.js", metadata, m, extra)
handler.help = ["umi-owner-enableplugin <nama_plugin>"]
handler.command = ["umi-owner-enableplugin", "umi-enableplugin", "umi-eplugin", "umi-pluginenable", "umi-onplugin", "enableplugin", "eplugin", "pluginenable", "onplugin"]
handler.tags = ["owner"]
handler.description = "Mengaktifkan kembali plugin yang dinonaktifkan"
handler.importSource = "umi"
handler.importConfig = {"name": "enableplugin", "alias": ["eplugin", "pluginenable", "onplugin"], "category": "owner", "description": "Mengaktifkan kembali plugin yang dinonaktifkan", "usage": ".enableplugin <nama_plugin>", "example": ".enableplugin sticker", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-enableplugin": "enableplugin", "umi-enableplugin": "enableplugin", "umi-eplugin": "eplugin", "umi-pluginenable": "pluginenable", "umi-onplugin": "onplugin", "enableplugin": "enableplugin", "eplugin": "eplugin", "pluginenable": "pluginenable", "onplugin": "onplugin"}
export default handler
