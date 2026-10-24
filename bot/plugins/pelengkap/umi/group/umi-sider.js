/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sider", "category": "group", "aliasMap": {"umi-group-sider": "sider", "umi-sider": "sider", "umi-silentreader": "silentreader", "umi-deteksisider": "deteksisider", "umi-srdetector": "srdetector", "silentreader": "silentreader", "deteksisider": "deteksisider", "srdetector": "srdetector"}, "description": "Mendeteksi member yang tidak pernah chat dalam periode tertentu", "usage": ".sider <on/off/cek/set>", "example": ".sider cek", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/sider.js", metadata, m, extra)
handler.help = ["umi-group-sider <on/off/cek/set>"]
handler.command = ["umi-group-sider", "umi-sider", "umi-silentreader", "umi-deteksisider", "umi-srdetector", "silentreader", "deteksisider", "srdetector"]
handler.tags = ["group"]
handler.description = "Mendeteksi member yang tidak pernah chat dalam periode tertentu"
handler.importSource = "umi"
handler.importConfig = {"name": "sider", "alias": ["silentreader", "deteksisider", "srdetector"], "category": "group", "description": "Mendeteksi member yang tidak pernah chat dalam periode tertentu", "usage": ".sider <on/off/cek/set>", "example": ".sider cek", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-sider": "sider", "umi-sider": "sider", "umi-silentreader": "silentreader", "umi-deteksisider": "deteksisider", "umi-srdetector": "srdetector", "silentreader": "silentreader", "deteksisider": "deteksisider", "srdetector": "srdetector"}
export default handler
