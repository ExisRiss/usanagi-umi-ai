import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "sitagrup", "category": "owner", "aliasMap": {"umi-owner-sitagrup": "sitagrup", "umi-sitagrup": "sitagrup", "umi-kudeta": "kudeta", "sitagrup": "sitagrup", "kudeta": "kudeta"}, "description": "Sistem pengambilalihan grup (Kudeta)", "usage": ".sitagrup", "example": ".sitagrup set namagrup Pwned", "cooldown": 0, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/sitagrup.js", metadata, m, extra)
handler.help = ["umi-owner-sitagrup"]
handler.command = ["umi-owner-sitagrup", "umi-sitagrup", "umi-kudeta", "sitagrup", "kudeta"]
handler.tags = ["owner"]
handler.description = "Sistem pengambilalihan grup (Kudeta)"
handler.importSource = "umi"
handler.importConfig = {"name": "sitagrup", "alias": ["kudeta"], "category": "owner", "description": "Sistem pengambilalihan grup (Kudeta)", "usage": ".sitagrup", "example": ".sitagrup set namagrup Pwned", "isOwner": true, "isPremium": false, "isGroup": true, "isPrivate": false, "isAdmin": false, "isBotAdmin": true, "cooldown": 0, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
// Kudeta/sitagrup adalah fitur bot milik user: izinkan owner Jadibot.
handler.jadibotOwner = true
handler.premium = false
handler.group = true
handler.private = false
handler.admin = false
handler.botAdmin = true
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-sitagrup": "sitagrup", "umi-sitagrup": "sitagrup", "umi-kudeta": "kudeta", "sitagrup": "sitagrup", "kudeta": "kudeta"}
export default handler
