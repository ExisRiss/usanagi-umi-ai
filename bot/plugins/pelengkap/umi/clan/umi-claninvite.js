/* Ported from Umi upstream — kredit penulis asli ada di CREDITS.md. */
import { runImportedFeature } from '../../../../lib/imported-compat.js'
const metadata = {"name": "claninvite", "category": "clan", "aliasMap": {"umi-clan-claninvite": "claninvite", "umi-claninvite": "claninvite", "umi-inviteclan": "inviteclan", "claninvite": "claninvite", "inviteclan": "inviteclan"}, "description": "Invite & langsung tambahkan user ke clan", "usage": ".claninvite @user", "example": ".claninvite @user", "cooldown": 10, "energi": 0}
const handler = (m, extra) => runImportedFeature("umi", "plugins/clan/claninvite.js", metadata, m, extra)
handler.help = ["umi-clan-claninvite @user"]
handler.command = ["umi-clan-claninvite", "umi-claninvite", "umi-inviteclan", "claninvite", "inviteclan"]
handler.tags = ["clan"]
handler.description = "Invite & langsung tambahkan user ke clan"
handler.importSource = "umi"
handler.importConfig = {"name": "claninvite", "alias": ["inviteclan"], "category": "clan", "description": "Invite & langsung tambahkan user ke clan", "usage": ".claninvite @user", "example": ".claninvite @user", "isOwner": false, "isPremium": false, "isGroup": false, "isPrivate": false, "cooldown": 10, "energi": 0, "isEnabled": true}
handler.owner = false
handler.rowner = false
handler.premium = false
handler.group = false
handler.private = false
handler.admin = false
handler.botAdmin = false
handler.level = 0
handler.limit = 0
handler.importAliasMap = {"umi-clan-claninvite": "claninvite", "umi-claninvite": "claninvite", "umi-inviteclan": "inviteclan", "claninvite": "claninvite", "inviteclan": "inviteclan"}
export default handler
