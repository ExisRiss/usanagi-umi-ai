import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "dellevel", "category": "owner", "aliasMap": {"umi-owner-dellevel": "dellevel", "umi-dellevel": "dellevel", "umi-kuranglevel": "kuranglevel", "umi-removelevel": "removelevel", "umi-dellvl": "dellvl", "dellevel": "dellevel", "kuranglevel": "kuranglevel", "removelevel": "removelevel", "dellvl": "dellvl"}, "description": "Kurangi level user (via exp)", "usage": ".dellevel <jumlah> @user", "example": ".dellevel 5 @user", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/dellevel.js", metadata, m, extra)
handler.help = ["umi-owner-dellevel <jumlah> @user"]
handler.command = ["umi-owner-dellevel", "umi-dellevel", "umi-kuranglevel", "umi-removelevel", "umi-dellvl", "dellevel", "kuranglevel", "removelevel", "dellvl"]
handler.tags = ["owner"]
handler.description = "Kurangi level user (via exp)"
handler.importSource = "umi"
handler.importConfig = {"name": "dellevel", "alias": ["kuranglevel", "removelevel", "dellvl"], "category": "owner", "description": "Kurangi level user (via exp)", "usage": ".dellevel <jumlah> @user", "example": ".dellevel 5 @user", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-dellevel": "dellevel", "umi-dellevel": "dellevel", "umi-kuranglevel": "kuranglevel", "umi-removelevel": "removelevel", "umi-dellvl": "dellvl", "dellevel": "dellevel", "kuranglevel": "kuranglevel", "removelevel": "removelevel", "dellvl": "dellvl"}
export default handler
