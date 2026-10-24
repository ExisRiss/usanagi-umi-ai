/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "levelup", "category": "user", "aliasMap": {"umi-user-levelup": "levelup", "umi-levelup": "levelup", "umi-lvlup": "lvlup", "umi-levelnotif": "levelnotif", "lvlup": "lvlup", "levelnotif": "levelnotif"}, "description": "Toggle notifikasi level up", "usage": ".levelup <on/off>", "example": ".levelup on", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/user/levelup.js", metadata, m, extra)
handler.help = ["umi-user-levelup <on/off>"]
handler.command = ["umi-user-levelup", "umi-levelup", "umi-lvlup", "umi-levelnotif", "lvlup", "levelnotif"]
handler.tags = ["user"]
handler.description = "Toggle notifikasi level up"
handler.importSource = "umi"
handler.importConfig = {"name": "levelup", "alias": ["lvlup", "levelnotif"], "category": "user", "description": "Toggle notifikasi level up", "usage": ".levelup <on/off>", "example": ".levelup on", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-user-levelup": "levelup", "umi-levelup": "levelup", "umi-lvlup": "lvlup", "umi-levelnotif": "levelnotif", "lvlup": "lvlup", "levelnotif": "levelnotif"}
export default handler
