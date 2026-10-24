/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "welcomeall", "category": "owner", "aliasMap": {"umi-owner-welcomeall": "welcomeall", "umi-welcomeall": "welcomeall", "umi-wcall": "wcall", "umi-globalwelcome": "globalwelcome", "welcomeall": "welcomeall", "wcall": "wcall", "globalwelcome": "globalwelcome"}, "description": "Aktifkan/nonaktifkan welcome di semua grup", "usage": ".welcomeall <on/off>", "example": ".welcomeall on", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/welcomeall.js", metadata, m, extra)
handler.help = ["umi-owner-welcomeall <on/off>"]
handler.command = ["umi-owner-welcomeall", "umi-welcomeall", "umi-wcall", "umi-globalwelcome", "welcomeall", "wcall", "globalwelcome"]
handler.tags = ["owner"]
handler.description = "Aktifkan/nonaktifkan welcome di semua grup"
handler.importSource = "umi"
handler.importConfig = {"name": "welcomeall", "alias": ["wcall", "globalwelcome"], "category": "owner", "description": "Aktifkan/nonaktifkan welcome di semua grup", "usage": ".welcomeall <on/off>", "example": ".welcomeall on", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-welcomeall": "welcomeall", "umi-welcomeall": "welcomeall", "umi-wcall": "wcall", "umi-globalwelcome": "globalwelcome", "welcomeall": "welcomeall", "wcall": "wcall", "globalwelcome": "globalwelcome"}
export default handler
