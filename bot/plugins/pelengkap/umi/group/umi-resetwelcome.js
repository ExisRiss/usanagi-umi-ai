/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "resetwelcome", "category": "group", "aliasMap": {"umi-group-resetwelcome": "resetwelcome", "umi-resetwelcome": "resetwelcome", "umi-delwelcome": "delwelcome", "umi-clearwelcome": "clearwelcome", "delwelcome": "delwelcome", "clearwelcome": "clearwelcome"}, "description": "Reset welcome message ke default", "usage": ".resetwelcome", "example": ".resetwelcome", "cooldown": 5, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/group/resetwelcome.js", metadata, m, extra)
handler.help = ["umi-group-resetwelcome"]
handler.command = ["umi-group-resetwelcome", "umi-resetwelcome", "umi-delwelcome", "umi-clearwelcome", "delwelcome", "clearwelcome"]
handler.tags = ["group"]
handler.description = "Reset welcome message ke default"
handler.importSource = "umi"
handler.importConfig = {"name": "resetwelcome", "alias": ["delwelcome", "clearwelcome"], "category": "group", "description": "Reset welcome message ke default", "usage": ".resetwelcome", "example": ".resetwelcome", "isOwner": false, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": true, "cooldown": 5, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = true
handler.private = false
handler.admin = true
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-group-resetwelcome": "resetwelcome", "umi-resetwelcome": "resetwelcome", "umi-delwelcome": "delwelcome", "umi-clearwelcome": "clearwelcome", "delwelcome": "delwelcome", "clearwelcome": "clearwelcome"}
export default handler
