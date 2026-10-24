/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "self", "category": "owner", "aliasMap": {"umi-owner-self": "self", "umi-self": "self", "umi-selfmode": "selfmode", "umi-private-mode": "private-mode", "selfmode": "selfmode", "private-mode": "private-mode"}, "description": "Mengaktifkan mode self (hanya owner & bot yang bisa akses)", "usage": ".self", "example": ".self", "cooldown": 3, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/owner/self.js", metadata, m, extra)
handler.help = ["umi-owner-self"]
handler.command = ["umi-owner-self", "umi-self", "umi-selfmode", "umi-private-mode", "selfmode", "private-mode"]
handler.tags = ["owner"]
handler.description = "Mengaktifkan mode self (hanya owner & bot yang bisa akses)"
handler.importSource = "umi"
handler.importConfig = {"name": "self", "alias": ["selfmode", "private-mode"], "category": "owner", "description": "Mengaktifkan mode self (hanya owner & bot yang bisa akses)", "usage": ".self", "example": ".self", "isOwner": true, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 3, "energi": 0, "isEnabled": true}
handler.owner = true
handler.rowner = true
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-owner-self": "self", "umi-self": "self", "umi-selfmode": "selfmode", "umi-private-mode": "private-mode", "selfmode": "selfmode", "private-mode": "private-mode"}
export default handler
